package ch.rasc.cettia.demo;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import io.cettia.Server;
import io.cettia.ServerSocketPredicates;

@Service
public class DataEmitterService {

	private final Server defaultServer;

	private final Random random = new Random();

	public DataEmitterService(Server defaultServer) {
		this.defaultServer = defaultServer;
	}

	@Scheduled(initialDelay = 2_000, fixedRate = 1_000)
	public void sendData() {
		List<Integer> data = new ArrayList<>();
		for (int i = 0; i < 5; i++) {
			data.add(this.random.nextInt(31));
		}
		this.defaultServer.find(ServerSocketPredicates.all()).send("data", data);
	}

}
