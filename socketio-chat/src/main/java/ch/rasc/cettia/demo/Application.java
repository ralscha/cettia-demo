package ch.rasc.cettia.demo;

import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.HandlerMapping;
import org.springframework.web.reactive.config.EnableWebFlux;
import org.springframework.web.reactive.function.server.RequestPredicate;
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
import io.cettia.ServerSocketPredicates;
import io.cettia.asity.bridge.spring.webflux5.AsityHandlerFunction;
import io.cettia.asity.bridge.spring.webflux5.AsityWebSocketHandler;
import io.cettia.transport.http.HttpTransportServer;
import io.cettia.transport.websocket.WebSocketTransportServer;

@SpringBootApplication
@EnableWebFlux
public class Application {

	private final Set<String> connectedClients = ConcurrentHashMap.newKeySet();

	@Bean
	public Server defaultServer() {
		Server server = new DefaultServer();

		server.onsocket(socket -> {

			// when the client emits 'new message', this listens and executes
			socket.on("new message", msg -> {
				// we tell the client to execute 'new message'
				Map<String, Object> data = new HashMap<>();
				data.put("username", socket.get("username"));
				data.put("message", msg);
				server.find(ServerSocketPredicates.id(socket).negate())
						.send("new message", data);
			});

			// when the client emits 'typing', we broadcast it to others
			socket.on("typing", _ -> {
				server.find(ServerSocketPredicates.id(socket).negate()).send("typing",
						Collections.singletonMap("username", socket.get("username")));
			});

			// when the client emits 'stop typing', we broadcast it to others
			socket.on("stop typing", _ -> {
				server.find(ServerSocketPredicates.id(socket).negate()).send(
						"stop typing",
						Collections.singletonMap("username", socket.get("username")));
			});

			// when the client emits 'add user', this listens and executes
			socket.on("add user", username -> {
				// we store the username in the socket session for this client
				socket.set("username", username);
				this.connectedClients.add(socket.id());

				socket.send("login", Collections.singletonMap("numUsers",
						this.connectedClients.size()));

				// echo globally (all clients) that a person has connected
				Map<String, Object> data = new HashMap<>();
				data.put("username", socket.get("username"));
				data.put("numUsers", this.connectedClients.size());
				server.find(ServerSocketPredicates.id(socket).negate())
						.send("user joined", data);
			});

			// when the user disconnects.. perform this
			socket.on("disconnect", _ -> {
				disconnect(server, socket);
			});

			socket.ondelete(_ -> {
				disconnect(server, socket);
			});

		});

		return server;
	}

	private void disconnect(Server server, ServerSocket socket) {
		if (this.connectedClients.remove(socket.id())) {
			// echo globally that this client has left
			Map<String, Object> data = new HashMap<>();
			data.put("username", socket.get("username"));
			data.put("numUsers", this.connectedClients.size());
			server.find(ServerSocketPredicates.id(socket).negate()).send("user left",
					data);
		}
	}

	@Bean
	public RouterFunction<ServerResponse> httpMapping(Server defaultServer,
			@Value("classpath:/static/index.html") final Resource indexHtml) {
		HttpTransportServer httpTransportServer = new HttpTransportServer()
				.ontransport(defaultServer);
		AsityHandlerFunction asityHandlerFunction = new AsityHandlerFunction()
				.onhttp(httpTransportServer);

		RequestPredicate isNotWebSocket = RequestPredicates
				.headers(headers -> !"websocket"
						.equalsIgnoreCase(headers.asHttpHeaders().getUpgrade()));

		return RouterFunctions
				.route(RequestPredicates.path("/cettia").and(isNotWebSocket),
						asityHandlerFunction)
				.and(RouterFunctions.route(RequestPredicates.GET("/"),
						_ -> ServerResponse.ok().contentType(MediaType.TEXT_HTML)
								.bodyValue(indexHtml)))
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