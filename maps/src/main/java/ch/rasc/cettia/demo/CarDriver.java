package ch.rasc.cettia.demo;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.core.io.ClassPathResource;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import com.fasterxml.jackson.databind.ObjectMapper;

import io.cettia.Server;

@Service
public class CarDriver {

	private final Server defaultServer;

	private int blueRoutePos = 0;

	private int redRoutePos = 0;

	private final List<LatLng> blueRoute;

	private final List<LatLng> redRoute;

	private final ObjectMapper objectMapper;

	public CarDriver(Server defaultServer, ObjectMapper objectMapper) throws IOException {
		this.defaultServer = defaultServer;
		this.objectMapper = objectMapper;

		this.blueRoute = readLatLng("/map/route_blue.txt");
		this.redRoute = readLatLng("/map/route_red.txt");
	}

	private static List<LatLng> readLatLng(String resource) throws IOException {
		List<LatLng> route;
		ClassPathResource cp = new ClassPathResource(resource);
		try (InputStream is = cp.getInputStream()) {
			String content = StreamUtils.copyToString(is, StandardCharsets.UTF_8);
			route = Arrays.stream(content.split("\n")).map(LatLng::new)
					.collect(Collectors.toList());
		}
		return route;
	}

	@Scheduled(initialDelay = 1000, fixedDelay = 1000)
	public void driveBlueCar() {

		LatLng latLng = this.blueRoute.get(this.blueRoutePos);
		this.blueRoutePos++;
		if (this.blueRoutePos >= this.blueRoute.size()) {
			this.blueRoutePos = 0;
		}

		this.defaultServer.all().send("map.blue",
				this.objectMapper.convertValue(latLng, Map.class));
	}

	@Scheduled(initialDelay = 2000, fixedDelay = 1200)
	public void driveRedCar() {
		LatLng latLng = this.redRoute.get(this.redRoutePos);
		this.redRoutePos++;
		if (this.redRoutePos >= this.redRoute.size()) {
			this.redRoutePos = 0;
		}

		this.defaultServer.all().send("map.red",
				this.objectMapper.convertValue(latLng, Map.class));
	}

}
