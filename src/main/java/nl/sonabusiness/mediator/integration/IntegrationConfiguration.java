package nl.sonabusiness.mediator.integration;

import java.io.File;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.integration.annotation.InboundChannelAdapter;
import org.springframework.integration.annotation.Poller;
import org.springframework.integration.channel.DirectChannel;
import org.springframework.integration.config.EnableIntegration;
import org.springframework.integration.core.MessageSource;
import org.springframework.integration.dsl.IntegrationFlow;
import org.springframework.integration.dsl.IntegrationFlows;
import org.springframework.integration.file.FileReadingMessageSource;
import org.springframework.integration.file.filters.SimplePatternFileListFilter;
import org.springframework.integration.file.transformer.FileToStringTransformer;
import org.springframework.messaging.MessageChannel;


@Configuration
@EnableIntegration
public class IntegrationConfiguration {

	@Autowired Environment env;

	@Bean
	public MessageChannel fileInputChannel1() {
		return new DirectChannel();
	}

	@Bean
	public MessageChannel fileInputChannel2() {
		return new DirectChannel();
	}

	@Bean
	public FileToStringTransformer fileToStringTransformer() {
		return new FileToStringTransformer();
	}

	@Bean
	public IntegrationFlow processFileFlow1() {
		return IntegrationFlows.from("fileInputChannel1")
				.transform(fileToStringTransformer())
				.handle("fileProcessor1", "process")
				.get();
	}

	@Bean
	public IntegrationFlow processFileFlow2() {
		return IntegrationFlows.from("fileInputChannel2")
				.transform(fileToStringTransformer())
				.handle("fileProcessor2", "process")
				.get();
	}
	
	@Bean
	@InboundChannelAdapter(value = "fileInputChannel1", poller = @Poller(fixedDelay = "1000"))
	public MessageSource<File> fileReadingMessageSource1() {
		FileReadingMessageSource source = new FileReadingMessageSource();
		source.setDirectory(new File(env.getProperty("input.folder.3g")));
		source.setFilter(new SimplePatternFileListFilter("*.zip"));
		return source;
	}

	@Bean
	@InboundChannelAdapter(value = "fileInputChannel2", poller = @Poller(fixedDelay = "1300"))
	public MessageSource<File> fileReadingMessageSource2() {
		FileReadingMessageSource source = new FileReadingMessageSource();
		source.setDirectory(new File(env.getProperty("input.folder.4g")));
		source.setFilter(new SimplePatternFileListFilter("*.zip"));
		return source;
	}
	
}
