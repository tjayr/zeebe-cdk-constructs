FROM camunda/zeebe:8.0.5

RUN mkdir /usr/local/zeebe/exporters && \
    curl -L https://github.com/camunda-community-hub/zeebe-hazelcast-exporter/releases/download/1.1.0/zeebe-hazelcast-exporter-1.1.0-jar-with-dependencies.jar --output /usr/local/zeebe/exporters/zeebe-hazelcast-exporter.jar
