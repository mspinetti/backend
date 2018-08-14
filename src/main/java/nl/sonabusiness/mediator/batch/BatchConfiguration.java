package nl.sonabusiness.mediator.batch;

import javax.sql.DataSource;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.core.launch.support.RunIdIncrementer;
import org.springframework.batch.item.file.FlatFileItemReader;
import org.springframework.batch.item.file.FlatFileItemWriter;
import org.springframework.batch.item.file.mapping.BeanWrapperFieldSetMapper;
import org.springframework.batch.item.file.mapping.DefaultLineMapper;
import org.springframework.batch.item.file.transform.BeanWrapperFieldExtractor;
import org.springframework.batch.item.file.transform.DelimitedLineAggregator;
import org.springframework.batch.item.file.transform.DelimitedLineTokenizer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.FileSystemResource;
import nl.sonabusiness.mediator.model.Cdr;
import nl.sonabusiness.mediator.model.BillingCdr;

@Configuration
@EnableBatchProcessing
public class BatchConfiguration {

	@Autowired
	public JobBuilderFactory jobBuilderFactory;

	@Autowired
	public StepBuilderFactory stepBuilderFactory;

	@Autowired
	public DataSource dataSource;

	// tag::readerwriterprocessor[]
	@Bean
	@StepScope
	public FlatFileItemReader<Cdr> reader(
			@Value("#{jobParameters[unzipped_folder]}") String input_folder,
			@Value("#{jobParameters[filename]}") String filename) 
	{
		FlatFileItemReader<Cdr> reader = new FlatFileItemReader<Cdr>();
		reader.setResource(new FileSystemResource(input_folder + filename + ".csv"));
		reader.setLinesToSkip(0);
		reader.setLineMapper(new DefaultLineMapper<Cdr>() {
			{
				setLineTokenizer(new DelimitedLineTokenizer() {
					{
						setNames(new String[] { "seq_id", "date", "time", "ratop", "onr", "nr", "bnrmask", "prtname",
								"prtcode", "oreg", "oregname", "reg", "regname", "oopcode", "opcode", "contractcode",
								"gwname", "custname", "location", "location1", "amount", "unit", "rated", "csc", "rate",
								"csc2", "rate2", "ratetype", "rateid", "vat", "custcode", "cref_id" });
						setStrict(false);
					}
				});
				setFieldSetMapper(new BeanWrapperFieldSetMapper<Cdr>() {
					{
						setTargetType(Cdr.class);
					}
				});
			}
		});
		return reader;
	}

	@Bean
	@StepScope
	public CdrItemProcessor processor() {
		return new CdrItemProcessor();
	}

	@Bean
	@StepScope
	public FlatFileItemWriter<BillingCdr> writer(
			@Value("#{jobParameters[output_folder]}") String output_folder,
			@Value("#{jobParameters[filename]}") String filename) {
		FlatFileItemWriter<BillingCdr> writer = new FlatFileItemWriter<>();
		writer.setResource(new FileSystemResource(output_folder + filename + ".csv"));
		writer.setShouldDeleteIfExists(true);

		writer.setLineAggregator(new DelimitedLineAggregator<BillingCdr>() {
			{
				setDelimiter(",");
				setFieldExtractor(new BeanWrapperFieldExtractor<BillingCdr>() {
					{
						setNames(new String[] { "userName", "portaOneServiceType", "h323ConnectTime", "acctSessionTime",
								"callingStationId", "calledStationId", "h323RemoteAddress", "nasPortName",
								"h323RemoteId", "portaOneUsedResource", "acctOutputOctets", "rated" });
					}
				});
			}
		});
		return writer;
	}

	// tag::jobstep[]
	@Bean
	public Job myJob(JobCompletionNotificationListener listener) {
		return jobBuilderFactory.get("myJob").incrementer(new RunIdIncrementer()).listener(listener)
				.flow(step1()).end().build();
	}

	@Bean
	public Step step1() {
		return stepBuilderFactory.get("step1").<Cdr, BillingCdr>chunk(10).reader(reader(null, null))
				.processor(processor()).writer(writer(null, null)).build();
	}
	// end::jobstep[]
}