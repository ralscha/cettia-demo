/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package ch.rasc.cettia.demo;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import io.cettia.Server;

/**
 * Sets up the timer for the multi-player snake game WebSocket example.
 */
@Service
public class SnakeService {

	private final Map<String, Snake> snakes = new ConcurrentHashMap<>();

	private final Server defaultServer;

	private Timer gameTimer;

	public SnakeService(Server defaultServer) {
		this.defaultServer = defaultServer;

		this.defaultServer.onsocket(socket -> {
			Snake newSnake = new Snake();
			if (this.snakes.isEmpty()) {
				startTimer();
			}
			this.snakes.put(newSnake.getId(), newSnake);
			SnakeMessage joinMsg = SnakeMessage.createJoinMessage(createJoinData());
			socket.onopen(v->this.defaultServer.all().send("snake", joinMsg));

			socket.ondelete(tmp -> removeSnake(newSnake.getId()));
			socket.<String>on("change", msg -> changeDirection(newSnake.getId(), msg));
		});
	}

	private void removeSnake(String snakeId) {

		this.snakes.remove(snakeId);
		if (this.snakes.isEmpty()) {
			if (this.gameTimer != null) {
				this.gameTimer.cancel();
				this.gameTimer = null;
			}
		}

		this.defaultServer.all().send("snake", SnakeMessage.createLeaveMessage(snakeId));

	}

	public void startTimer() {
		this.gameTimer = new Timer(SnakeService.class.getSimpleName() + " Timer");
		this.gameTimer.scheduleAtFixedRate(new TimerTask() {
			@Override
			public void run() {
				tick();

			}
		}, 100, 100);
	}

	public void tick() {
		Collection<Snake> allSnakes = getSnakes();
		List<Map<String, Object>> updateData = new ArrayList<>();
		for (Snake snake : allSnakes) {
			snake.update(allSnakes, this.defaultServer);

			Map<String, Object> locationsData = snake.getLocationsData();
			if (locationsData != null) {
				updateData.add(locationsData);
			}
		}

		if (!updateData.isEmpty()) {
			this.defaultServer.all().send("snake",
					SnakeMessage.createUpdateMessage(updateData));
		}
	}

	private Collection<Snake> getSnakes() {
		return Collections.unmodifiableCollection(this.snakes.values());
	}

	public List<Map<String, Object>> createJoinData() {
		List<Map<String, Object>> result = new ArrayList<>();
		for (Snake snake : getSnakes()) {
			Map<String, Object> es = new HashMap<>();
			es.put("id", snake.getId());
			es.put("color", snake.getHexColor());

			List<Location> locations = new ArrayList<>();
			locations.add(snake.getHead());
			locations.addAll(snake.getTail());
			es.put("body", locations);

			result.add(es);
		}
		return result;
	}

	private void changeDirection(String id, String message) {
		Snake snake = this.snakes.get(id);
		if (snake != null) {
			if ("west".equals(message)) {
				snake.setDirection(Direction.WEST);
			}
			else if ("north".equals(message)) {
				snake.setDirection(Direction.NORTH);
			}
			else if ("east".equals(message)) {
				snake.setDirection(Direction.EAST);
			}
			else if ("south".equals(message)) {
				snake.setDirection(Direction.SOUTH);
			}
		}
	}

}
