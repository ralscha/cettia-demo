package ch.rasc.cettia.demo;

import java.io.IOException;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.reactive.HandlerMapping;
import org.springframework.web.reactive.config.EnableWebFlux;
import org.springframework.web.reactive.function.server.RequestPredicates;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.RouterFunctions;
import org.springframework.web.reactive.function.server.ServerResponse;
import org.springframework.web.reactive.handler.SimpleUrlHandlerMapping;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.server.support.WebSocketHandlerAdapter;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;

import io.cettia.DefaultServer;
import io.cettia.Server;
import io.cettia.ServerSocket;
import io.cettia.asity.action.Action;
import io.cettia.asity.bridge.spring.webflux5.AsityHandlerFunction;
import io.cettia.asity.bridge.spring.webflux5.AsityWebSocketHandler;
import io.cettia.transport.http.HttpTransportServer;
import io.cettia.transport.websocket.WebSocketTransportServer;

@SpringBootApplication
@EnableWebFlux
@EnableScheduling
public class Application {

	private final Set<String> rooms = ConcurrentHashMap.newKeySet();
	private final Map<String, Cache<Message, Boolean>> roomMessages = new ConcurrentHashMap<>();
	private final Set<String> users = ConcurrentHashMap.newKeySet();

	@Bean
	public AppConfig appConfig() {
		return new AppConfig();
	}

	@Bean
	public TranslateService translationService() {
		try {
			return new TranslateService(appConfig());
		}
		catch (IOException e) {
			LoggerFactory.getLogger(Application.class).error("create translate service",
					e);
		}
		return null;
	}

	@Bean
	public Server defaultServer() {
		Server server = new DefaultServer();

		server.onsocket(socket -> {
			socket.<Map<String, Object>>on("signin", msg -> {
				String username = (String) msg.get("username");
				if (!this.users.contains(username)) {
					this.users.add(username);
					socket.set("username", username);
					socket.set("language", msg.get("language"));
					socket.send("signedin",
							Collections.singletonMap("rooms", this.rooms));
				}
				else {
					socket.send("userexists");
				}
			});

			socket.<Map<String, Object>>on("msg", msg -> {
				String room = (String) msg.get("room");
				String msgText = (String) msg.get("message");

				Message message = new Message();
				message.setMessage(msgText);
				message.setLang((String) socket.get("language"));
				message.setSendDate(System.currentTimeMillis());
				message.setType(MessageType.MSG);
				message.setUser(socket.get("username"));
				store(room, message);

				server.byTag(room).execute(skt -> {
					String targetLang = (String) skt.get("language");
					skt.send("newMsg",
							Collections.singleton(message.withMessage(translationService()
									.translate(msgText, message.getLang(), targetLang))));
				});
			});

			socket.<Map<String, Object>>on("newRoom", msg -> {
				String room = (String) msg.get("room");
				if (!this.rooms.contains(room)) {
					this.rooms.add(room);
					server.all().send("roomAdded", msg);
				}
			});

			socket.<Map<String, Object>>on("leftRoom", msg -> {
				String room = (String) msg.get("room");
				socket.untag(room);

				String username = socket.get("username");
				Message message = new Message();
				message.setMessage(username + " has left the room");
				message.setSendDate(System.currentTimeMillis());
				message.setType(MessageType.LEAVE);
				message.setUser(username);
				store(room, message);
				server.byTag(room).send("newMsg", Collections.singleton(message));
			});

			socket.<Map<String, Object>>on("joinedRoom", msg -> {
				String room = (String) msg.get("room");
				socket.tag(room);

				String targetLang = (String) socket.get("language");
				socket.send("existingMessages", getMessages(room, targetLang));

				String username = socket.get("username");
				Message message = new Message();
				message.setMessage(username + " has joined the room");
				message.setSendDate(System.currentTimeMillis());
				message.setType(MessageType.JOIN);
				message.setUser(username);
				store(room, message);
				server.byTag(room).send("newMsg", Collections.singleton(message));
			});

			Queue<Object[]> queue = new ConcurrentLinkedQueue<>();
			socket.oncache(args -> queue.offer(args));
			socket.onopen(v -> {
			  while (socket.state() == ServerSocket.State.OPENED && !queue.isEmpty()) {
			    Object[] args = queue.poll();
			    socket.send((String) args[0], args[1], (Action<?>) args[2], (Action<?>) args[3]);
			  }
			});
			
			socket.ondelete(msg -> {
				queue.forEach(args -> System.out.println(socket + " missed event - name: " + args[0] + ", data: " + args[1]));
				
				String username = socket.get("username");
				if (username != null) {
					this.users.remove(username);
				}
			});

		});

		return server;
	}

	private void store(String room, Message message) {
		this.roomMessages
				.computeIfAbsent(room, k -> Caffeine.newBuilder()
						.expireAfterWrite(6, TimeUnit.HOURS).maximumSize(100).build())
				.put(message, true);
	}

	private List<Message> getMessages(String room, String targetLang) {
		Cache<Message, Boolean> cache = this.roomMessages.get(room);
		if (cache != null) {
			return cache.asMap().keySet().stream()
					.sorted(Comparator.comparing(Message::getSendDate))
					.map(msg -> msg.withMessage(translationService()
							.translate(msg.getMessage(), msg.getLang(), targetLang)))
					.collect(Collectors.toList());
		}
		return Collections.emptyList();
	}

	@Scheduled(fixedDelay = 21_600_000)
	public void removeOldRooms() {
		Set<String> oldRooms = new HashSet<>();
		this.roomMessages.forEach((k, v) -> {
			v.cleanUp();
			if (v.estimatedSize() == 0) {
				oldRooms.add(k);
			}
		});

		if (!oldRooms.isEmpty()) {
			oldRooms.forEach(this.roomMessages::remove);
			oldRooms.forEach(this.rooms::remove);

			defaultServer().all().send("roomsRemoved", oldRooms);
		}
	}

	@Bean
	public RouterFunction<ServerResponse> httpMapping(Server defaultServer,
			@Value("classpath:/static/index.html") final Resource indexHtml) {
		HttpTransportServer httpTransportServer = new HttpTransportServer()
				.ontransport(defaultServer);
		AsityHandlerFunction asityHandlerFunction = new AsityHandlerFunction()
				.onhttp(httpTransportServer);

		return RouterFunctions
				.route(RequestPredicates.path("/cettia")
						.and(RequestPredicates.headers(headers -> !"websocket"
								.equalsIgnoreCase(headers.asHttpHeaders().getUpgrade()))),
						asityHandlerFunction)
				.and(RouterFunctions.route(RequestPredicates.GET("/"),
						request -> ServerResponse.ok().contentType(MediaType.TEXT_HTML)
								.syncBody(indexHtml)))
				.and(RouterFunctions.resources("/**", new ClassPathResource("static/")));
	}

	@Bean
	public HandlerMapping wsMapping(Server defaultServer) {
		WebSocketTransportServer wsTransportServer = new WebSocketTransportServer()
				.ontransport(defaultServer);
		AsityWebSocketHandler asityWebSocketHandler = new AsityWebSocketHandler()
				.onwebsocket(wsTransportServer);
		Map<String, WebSocketHandler> map = new LinkedHashMap<>();
		map.put("/cettia", asityWebSocketHandler);

		SimpleUrlHandlerMapping mapping = new SimpleUrlHandlerMapping();
		mapping.setUrlMap(map);

		return mapping;
	}

	@Bean
	public WebSocketHandlerAdapter webSocketHandlerAdapter() {
		return new WebSocketHandlerAdapter();
	}

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}
}