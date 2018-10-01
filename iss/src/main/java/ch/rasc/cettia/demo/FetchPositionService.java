package ch.rasc.cettia.demo;

import java.io.IOException;
import java.util.Map;

import org.apache.commons.logging.LogFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import io.cettia.Server;
import io.cettia.ServerSocketPredicates;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.ResponseBody;

@Service
public class FetchPositionService {

	private final static String ISS_NOTIFY_URL = "http://api.open-notify.org/iss-now.json";

	private final Server defaultServer;

	private final ObjectMapper objectMapper;

	private final OkHttpClient client;

	public FetchPositionService(Server defaultServer, ObjectMapper objectMapper) {
		this.defaultServer = defaultServer;
		this.objectMapper = objectMapper;
		this.client = new OkHttpClient();
	}

	private Map<String, Object> fetchCurrentLocation() {
		Request request = new Request.Builder().url(ISS_NOTIFY_URL).build();
		try (Response response = this.client.newCall(request).execute();
				ResponseBody body = response.body()) {
			if (body != null) {
				Map<String, Object> location = this.objectMapper.readValue(body.string(),
						Map.class);
				return location;
			}
		}
		catch (IOException e) {
			LogFactory.getLog(this.getClass()).error("fetch current location", e);
		}
		return null;
	}

	@Scheduled(initialDelay = 1000, fixedDelay = 3000)
	public void publish() {
		Map<String, Object> currentLocation = fetchCurrentLocation();
		this.defaultServer.find(ServerSocketPredicates.all()).send("location", currentLocation);
	}

}
