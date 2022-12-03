package ch.rasc.cettia.webmvc;

import java.util.concurrent.Executors;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.core.Ordered;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ConcurrentTaskScheduler;
import org.springframework.web.servlet.HandlerMapping;
import org.springframework.web.servlet.handler.AbstractHandlerMapping;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import io.cettia.DefaultServer;
import io.cettia.Server;
import io.cettia.asity.bridge.spring.webmvc4.AsityController;
import io.cettia.asity.bridge.spring.webmvc4.AsityWebSocketHandler;
import io.cettia.transport.http.HttpTransportServer;
import io.cettia.transport.websocket.WebSocketTransportServer;

@SpringBootApplication
@EnableWebSocket
@EnableScheduling
public class Application implements WebSocketConfigurer {

	@Bean
	public TaskScheduler taskScheduler() {
		return new ConcurrentTaskScheduler(Executors.newSingleThreadScheduledExecutor());
	}

	@Bean
	public Server defaultServer() {
		return new DefaultServer();
	}

	@Bean
	public HandlerMapping httpMapping() {
		HttpTransportServer httpTransportServer = new HttpTransportServer()
				.ontransport(defaultServer());

		AsityController asityController = new AsityController()
				.onhttp(httpTransportServer);
		AbstractHandlerMapping mapping = new AbstractHandlerMapping() {
			@Override
			protected Object getHandlerInternal(HttpServletRequest request) {
				return "/cettia".equals(request.getRequestURI()) &&
				// Delegates WebSocket handshake requests to a webSocketHandler bean
				!"websocket".equalsIgnoreCase(request.getHeader("upgrade"))
						? asityController
						: null;
			}
		};
		mapping.setOrder(Ordered.HIGHEST_PRECEDENCE);
		return mapping;
	}

	@Override
	public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
		WebSocketTransportServer wsTransportServer = new WebSocketTransportServer()
				.ontransport(defaultServer());
		AsityWebSocketHandler asityWebSocketHandler = new AsityWebSocketHandler()
				.onwebsocket(wsTransportServer);

		registry.addHandler(asityWebSocketHandler, "/cettia");
	}

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}
}
