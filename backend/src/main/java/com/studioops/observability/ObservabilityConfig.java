package com.studioops.observability;

import com.studioops.user.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ObservabilityConfig {

    @Bean
    public ApiRequestLoggingFilter apiRequestLoggingFilter(
            ApiRequestLogRepository logRepository,
            UserRepository userRepository) {
        return new ApiRequestLoggingFilter(logRepository, userRepository);
    }
}
