package com.audi.usuarios;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class ServiceUsuariosApplication {
    public static void main(String[] args) {
        SpringApplication.run(ServiceUsuariosApplication.class, args);
        System.out.println(">>> SERVICE USUARIOS STARTED ON PORT 8082");
    }
}
