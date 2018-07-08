package ch.rasc.cettia.smoothie;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import io.cettia.Server;

@Service
public class CpuDataService {

	private final Server defaultServer;

	private final Random random = new Random();

	public CpuDataService(Server defaultServer) {
		this.defaultServer = defaultServer;
	}

	@Scheduled(initialDelay = 3_000, fixedDelay = 1_000)
	public void sendData() {
		// System.out.println("SENDING DATA:"+System.currentTimeMillis());
		Map<String, Object> data = new HashMap<>();
		data.put("time", System.currentTimeMillis());
		data.put("host1",
				new double[] { this.random.nextDouble(), this.random.nextDouble(),
						this.random.nextDouble(), this.random.nextDouble() });
		data.put("host2",
				new double[] { this.random.nextDouble(), this.random.nextDouble(),
						this.random.nextDouble(), this.random.nextDouble() });
		data.put("host3",
				new double[] { this.random.nextDouble(), this.random.nextDouble(),
						this.random.nextDouble(), this.random.nextDouble() });
		data.put("host4",
				new double[] { this.random.nextDouble(), this.random.nextDouble(),
						this.random.nextDouble(), this.random.nextDouble() });

		this.defaultServer.all().send("smoothie", data);
	}

}
