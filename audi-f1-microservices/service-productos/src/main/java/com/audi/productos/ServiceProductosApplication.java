package com.audi.productos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class ServiceProductosApplication {
    public static void main(String[] args) {
        SpringApplication.run(ServiceProductosApplication.class, args);
        System.out.println(">>> SERVICE PRODUCTOS STARTED ON PORT 8081");
    }
}
