---
name: kafka-event-publisher-skill
description: Implement event-driven architecture using Apache Kafka for publishing and consuming events in microservices applications.
---

# Kafka Event Publisher Skill

## Purpose
Implement event-driven architecture using Apache Kafka for reliable, scalable event publishing and consumption in distributed systems.

## Kafka Basics

### Core Concepts
- **Topic** - Event category/channel (e.g., "todo-created", "user-registered")
- **Producer** - Publishes events to topics
- **Consumer** - Subscribes to topics and processes events
- **Partition** - Topic subdivisions for parallelism
- **Broker** - Kafka server instance

## Setup Kafka

### Local Development (Docker)
```bash
# docker-compose.yaml for Kafka
version: '3'
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    ports:
      - "2181:2181"

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1

# Start Kafka
docker-compose up -d

# Verify
docker-compose ps
```

### Cloud Kafka (Confluent Cloud / AWS MSK)
```bash
# Use managed Kafka service
# Get bootstrap servers and credentials from provider
# Configure in application
```

## Event Schema Design

### Event Structure
```json
{
  "eventId": "uuid",
  "eventType": "todo.created",
  "timestamp": "2024-02-07T10:30:00Z",
  "version": "1.0",
  "source": "todo-backend",
  "data": {
    "todoId": "123",
    "userId": "456",
    "title": "Buy groceries",
    "status": "pending",
    "priority": "high"
  },
  "metadata": {
    "correlationId": "request-789",
    "causationId": "event-012"
  }
}
```

### Event Types for Todo App
```
User Events:
- user.registered
- user.logged_in
- user.profile_updated

Todo Events:
- todo.created
- todo.updated
- todo.completed
- todo.deleted
- todo.status_changed

Category Events:
- category.created
- category.updated
- category.deleted
```

## Python Producer (FastAPI Backend)

### Install Dependencies
```bash
pip install confluent-kafka pydantic
```

### Kafka Producer Implementation
```python
# kafka_producer.py
from confluent_kafka import Producer
from datetime import datetime
import json
import uuid

class KafkaEventPublisher:
    def __init__(self, bootstrap_servers: str):
        self.producer = Producer({
            'bootstrap.servers': bootstrap_servers,
            'client.id': 'todo-backend-producer'
        })

    def publish_event(self, topic: str, event_type: str, data: dict, source: str = "todo-backend"):
        event = {
            "eventId": str(uuid.uuid4()),
            "eventType": event_type,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "version": "1.0",
            "source": source,
            "data": data,
            "metadata": {}
        }

        # Publish to Kafka
        self.producer.produce(
            topic=topic,
            key=str(data.get('id', '')),  # Use entity ID as key
            value=json.dumps(event).encode('utf-8'),
            callback=self._delivery_callback
        )

        # Wait for message to be delivered
        self.producer.flush()

    def _delivery_callback(self, err, msg):
        if err:
            print(f"❌ Event delivery failed: {err}")
        else:
            print(f"✅ Event delivered to {msg.topic()} [{msg.partition()}]")

    def close(self):
        self.producer.flush()

# Initialize publisher
kafka_publisher = KafkaEventPublisher(
    bootstrap_servers="localhost:9092"
)
```

### Publish Events in API Endpoints
```python
# main.py (FastAPI)
from fastapi import FastAPI
from kafka_producer import kafka_publisher

app = FastAPI()

@app.post("/todos")
async def create_todo(todo: TodoCreate, current_user: User):
    # Save to database
    new_todo = await todo_service.create(todo, current_user.id)

    # Publish event
    kafka_publisher.publish_event(
        topic="todo-events",
        event_type="todo.created",
        data={
            "todoId": new_todo.id,
            "userId": current_user.id,
            "title": new_todo.title,
            "status": new_todo.status,
            "priority": new_todo.priority,
            "createdAt": new_todo.created_at.isoformat()
        }
    )

    return new_todo

@app.put("/todos/{todo_id}")
async def update_todo(todo_id: int, todo_update: TodoUpdate, current_user: User):
    # Update in database
    updated_todo = await todo_service.update(todo_id, todo_update, current_user.id)

    # Publish event
    kafka_publisher.publish_event(
        topic="todo-events",
        event_type="todo.updated",
        data={
            "todoId": updated_todo.id,
            "userId": current_user.id,
            "changes": todo_update.dict(exclude_unset=True),
            "updatedAt": updated_todo.updated_at.isoformat()
        }
    )

    return updated_todo

@app.patch("/todos/{todo_id}/complete")
async def complete_todo(todo_id: int, current_user: User):
    # Mark as complete
    completed_todo = await todo_service.complete(todo_id, current_user.id)

    # Publish event
    kafka_publisher.publish_event(
        topic="todo-events",
        event_type="todo.completed",
        data={
            "todoId": completed_todo.id,
            "userId": current_user.id,
            "completedAt": completed_todo.completed_at.isoformat()
        }
    )

    return completed_todo
```

## Python Consumer

### Consumer Implementation
```python
# kafka_consumer.py
from confluent_kafka import Consumer, KafkaException
import json

class KafkaEventConsumer:
    def __init__(self, bootstrap_servers: str, group_id: str, topics: list):
        self.consumer = Consumer({
            'bootstrap.servers': bootstrap_servers,
            'group.id': group_id,
            'auto.offset.reset': 'earliest',
            'enable.auto.commit': True
        })
        self.consumer.subscribe(topics)

    def consume_events(self, handler_function):
        try:
            while True:
                msg = self.consumer.poll(timeout=1.0)

                if msg is None:
                    continue

                if msg.error():
                    raise KafkaException(msg.error())

                # Parse event
                event = json.loads(msg.value().decode('utf-8'))

                # Handle event
                handler_function(event)

        except KeyboardInterrupt:
            pass
        finally:
            self.consumer.close()

# Event handler
def handle_todo_event(event: dict):
    event_type = event.get('eventType')
    data = event.get('data')

    if event_type == 'todo.created':
        print(f"📝 Todo created: {data.get('title')}")
        # Send notification, update analytics, etc.

    elif event_type == 'todo.completed':
        print(f"✅ Todo completed: {data.get('todoId')}")
        # Send congratulations email, update stats

    elif event_type == 'todo.updated':
        print(f"📝 Todo updated: {data.get('todoId')}")
        # Sync with external systems

# Start consumer
if __name__ == "__main__":
    consumer = KafkaEventConsumer(
        bootstrap_servers="localhost:9092",
        group_id="todo-notification-service",
        topics=["todo-events"]
    )

    consumer.consume_events(handle_todo_event)
```

## TypeScript/JavaScript Producer (Next.js)

### Install Dependencies
```bash
npm install kafkajs
```

### Producer Implementation
```typescript
// lib/kafka-producer.ts
import { Kafka, Producer } from 'kafkajs';

class KafkaEventPublisher {
  private kafka: Kafka;
  private producer: Producer;

  constructor(brokers: string[]) {
    this.kafka = new Kafka({
      clientId: 'todo-frontend',
      brokers: brokers,
    });
    this.producer = this.kafka.producer();
  }

  async connect() {
    await this.producer.connect();
  }

  async publishEvent(topic: string, eventType: string, data: any) {
    const event = {
      eventId: crypto.randomUUID(),
      eventType: eventType,
      timestamp: new Date().toISOString(),
      version: '1.0',
      source: 'todo-frontend',
      data: data,
      metadata: {},
    };

    await this.producer.send({
      topic: topic,
      messages: [
        {
          key: data.id?.toString() || '',
          value: JSON.stringify(event),
        },
      ],
    });

    console.log(`✅ Event published: ${eventType}`);
  }

  async disconnect() {
    await this.producer.disconnect();
  }
}

export const kafkaPublisher = new KafkaEventPublisher(['localhost:9092']);
```

## Event-Driven Patterns

### Pattern 1: Event Notification
```python
# Notify other services when something happens
# Example: Send email when todo is created

@app.post("/todos")
async def create_todo(todo: TodoCreate):
    new_todo = await save_todo(todo)

    # Publish event - email service will listen
    kafka_publisher.publish_event(
        topic="todo-events",
        event_type="todo.created",
        data=new_todo.dict()
    )

    return new_todo
```

### Pattern 2: Event-Carried State Transfer
```python
# Include full state in event so consumers don't need to query

kafka_publisher.publish_event(
    topic="todo-events",
    event_type="todo.completed",
    data={
        "todoId": todo.id,
        "userId": todo.user_id,
        "title": todo.title,
        "description": todo.description,
        "completedAt": datetime.utcnow().isoformat(),
        # Include all necessary data
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }
)
```

### Pattern 3: Event Sourcing (Advanced)
```python
# Store all changes as events, rebuild state by replaying events
# Every update is an event stored in Kafka
# Current state = replay all events

# Not recommended for beginners - use only if needed
```

## Monitoring & Operations

### Check Topics
```bash
# List topics
docker exec -it kafka kafka-topics --list --bootstrap-server localhost:9092

# Create topic
docker exec -it kafka kafka-topics --create \
  --topic todo-events \
  --partitions 3 \
  --replication-factor 1 \
  --bootstrap-server localhost:9092

# Describe topic
docker exec -it kafka kafka-topics --describe \
  --topic todo-events \
  --bootstrap-server localhost:9092
```

### Check Consumer Groups
```bash
# List consumer groups
docker exec -it kafka kafka-consumer-groups --list \
  --bootstrap-server localhost:9092

# Describe consumer group
docker exec -it kafka kafka-consumer-groups --describe \
  --group todo-notification-service \
  --bootstrap-server localhost:9092
```

### View Messages
```bash
# Consume from beginning
docker exec -it kafka kafka-console-consumer \
  --topic todo-events \
  --from-beginning \
  --bootstrap-server localhost:9092
```

## Error Handling

### Retry Logic
```python
from tenacity import retry, stop_after_attempt, wait_exponential

class RobustKafkaPublisher:
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10)
    )
    def publish_event_with_retry(self, topic: str, event_type: str, data: dict):
        try:
            kafka_publisher.publish_event(topic, event_type, data)
        except Exception as e:
            print(f"❌ Failed to publish event: {e}")
            raise  # Retry will happen
```

### Dead Letter Queue
```python
# If event processing fails, send to DLQ
def handle_event_with_dlq(event: dict):
    try:
        process_event(event)
    except Exception as e:
        print(f"❌ Event processing failed: {e}")
        # Send to dead letter queue
        kafka_publisher.publish_event(
            topic="todo-events-dlq",
            event_type="event.processing.failed",
            data={
                "originalEvent": event,
                "error": str(e)
            }
        )
```

## Best Practices

✅ Use meaningful event types (todo.created, not event1)
✅ Include event metadata (ID, timestamp, version)
✅ Use entity ID as message key for ordering
✅ Keep events immutable (don't modify after publishing)
✅ Version your event schemas
✅ Handle consumer failures gracefully
✅ Monitor consumer lag
✅ Use separate topics for different domains

## When to Use This Skill

✅ Building event-driven microservices
✅ Decoupling services (no direct HTTP calls)
✅ Real-time notifications and updates
✅ Audit logs and analytics
✅ Integration with external systems

❌ Simple CRUD apps (use REST API instead)
❌ Synchronous request-response (use HTTP)
❌ When eventual consistency is not acceptable
