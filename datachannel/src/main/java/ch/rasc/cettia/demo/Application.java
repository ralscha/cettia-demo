package ch.rasc.cettia.demo;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.reactive.HandlerMapping;
import org.springframework.web.reactive.config.EnableWebFlux;
import org.springframework.web.reactive.function.server.RequestPredicates;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.RouterFunctions;
import org.springframework.web.reactive.function.server.ServerResponse;
import org.springframework.web.reactive.handler.SimpleUrlHandlerMapping;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.server.support.WebSocketHandlerAdapter;

import io.cettia.DefaultServer;
import io.cettia.Server;
import io.cettia.ServerSocket;
import io.cettia.ServerSocketPredicate;
import io.cettia.asity.bridge.spring.webflux5.AsityHandlerFunction;
import io.cettia.asity.bridge.spring.webflux5.AsityWebSocketHandler;
import io.cettia.transport.http.HttpTransportServer;
import io.cettia.transport.websocket.WebSocketTransportServer;

@SpringBootApplication
@EnableWebFlux
@EnableScheduling
public class Application {

	@Bean
	public Server defaultServer() {

		Server server = new DefaultServer();

		server.onsocket(socket -> {

			socket.on("connect", msg -> {
				socket.send("connected", Collections.singletonMap("id", socket.id()));
				server.find(excludeMe(socket)).send("peer.connected",
						Collections.singletonMap("id", socket.id()));
			});

			socket.<Map<String, Object>>on("offer", msg -> {
				String receiverId = (String) msg.get("receiver");
				server.find(receiver(receiverId)).send("offer", msg);
			});
			socket.<Map<String, Object>>on("answer", msg -> {
				String receiverId = (String) msg.get("receiver");
				server.find(receiver(receiverId)).send("answer", msg);
			});
			socket.<Map<String, Object>>on("ice", msg -> {
				String receiverId = (String) msg.get("receiver");
				server.find(receiver(receiverId)).send("ice", msg);
			});

			socket.ondelete(msg -> {
				server.all().send("peer.disconnected",
						Collections.singletonMap("id", socket.id()));
			});

		});

		return server;
	}

	private static ServerSocketPredicate receiver(String id) {
		return skt -> skt.id().equals(id);
	}

	private static ServerSocketPredicate excludeMe(ServerSocket socket) {
		return skt -> !socket.id().equals(skt.id());
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