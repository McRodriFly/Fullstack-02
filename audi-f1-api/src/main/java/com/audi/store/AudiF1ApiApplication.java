package com.audi.store;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AudiF1ApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(AudiF1ApiApplication.class, args);
		System.out.println("==================================================");
		System.out.println("🚀 AUDI F1 STORE BACKEND ARRANCÓ CORRECTAMENTE");
		System.out.println("📘 Swagger UI: http://localhost:8080/swagger-ui.html");
		System.out.println("🗄️ H2 Console: http://localhost:8080/h2-console");
		System.out.println("==================================================");
	}
}
