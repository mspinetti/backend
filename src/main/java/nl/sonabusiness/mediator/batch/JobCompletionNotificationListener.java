package nl.sonabusiness.mediator.batch;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.batch.core.BatchStatus;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.launch.JobOperator;
import org.springframework.batch.core.listener.JobExecutionListenerSupport;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.dao.DataIntegrityViolationException;

import nl.sonabusiness.mediator.integration.FileProcessorHelper;
import nl.sonabusiness.mediator.model.FileEntry;
import nl.sonabusiness.mediator.model.repos.FileEntryRepository;

@Component
public class JobCompletionNotificationListener extends JobExecutionListenerSupport {

	@Autowired FileEntryRepository file_repo;
	@Autowired FileEntry fileEntry;
	@Autowired JobOperator jobOperator;

	FileEntry temp;
	private static final Logger log = LoggerFactory.getLogger(JobCompletionNotificationListener.class);

	@Override
	public void beforeJob(JobExecution jobExecution) {
	
		Long sequence = jobExecution.getJobParameters().getLong("sequence");
		Long version = jobExecution.getJobParameters().getLong("version");
		String filename = jobExecution.getJobParameters().getString("filename");
		String fileType = jobExecution.getJobParameters().getString("filetype");
		String contractId = jobExecution.getJobParameters().getString("contractId");

		fileEntry.setId(0L);
		fileEntry.setFilename(filename);
		fileEntry.setCreated(new Date());
		fileEntry.resetQs();
		fileEntry.setSequence(sequence.intValue());
		fileEntry.setVersion(version.intValue());
		fileEntry.setStatus('R');
		fileEntry.setFile_type(fileType);
		fileEntry.setContractId(contractId);

		try {
			temp = file_repo.save(fileEntry);
			fileEntry.setId(temp.getId());
		} catch (DataIntegrityViolationException e) {
		}
		super.beforeJob(jobExecution);
	}

	@Override
	public void afterJob(JobExecution jobExecution) {
		System.out.println(jobExecution.getStatus());

		FileProcessorHelper.MoveFiles(
				jobExecution.getJobParameters().getString("input_folder"), 
				jobExecution.getJobParameters().getString("unzipped_folder"), 
				jobExecution.getJobParameters().getString("history_folder"),
				jobExecution.getJobParameters().getString("filename"));

		if (jobExecution.getStatus() == BatchStatus.COMPLETED) {
			fileEntry.setId(temp.getId());
			fileEntry.setStatus('P'); // Processed
			file_repo.save(fileEntry);
			log.info("!!! JOB FINISHED! File {} was processed successfully", jobExecution.getJobParameters().getString("filename"));
		}
	}
}