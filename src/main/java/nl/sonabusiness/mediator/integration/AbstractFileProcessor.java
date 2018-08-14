package nl.sonabusiness.mediator.integration;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.attribute.BasicFileAttributeView;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.Date;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.JobParametersInvalidException;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.repository.JobExecutionAlreadyRunningException;
import org.springframework.batch.core.repository.JobInstanceAlreadyCompleteException;
import org.springframework.batch.core.repository.JobRestartException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.messaging.Message;
import org.springframework.stereotype.Component;

import nl.sonabusiness.mediator.model.FileEntry;
import nl.sonabusiness.mediator.model.RuleManager;
import nl.sonabusiness.mediator.model.repos.FileEntryRepository;

public abstract class AbstractFileProcessor {

	@Autowired Job job;
	@Autowired JobLauncher jobLauncher;
	@Autowired RuleManager ruleManager;
	@Autowired Environment env;
	@Autowired FileEntryRepository file_repo;
	
	private static final String HEADER_FILE_NAME = "file_name";

	String fileName = "";
	File inputFilePath;
	String INPUT_FOLDER = "";

	public void process(Message<String> msg) {
		fileName = (String) msg.getHeaders().get(HEADER_FILE_NAME);
		inputFilePath = (File) msg.getHeaders().get("file_originalFile");
		INPUT_FOLDER = inputFilePath.getParentFile().getAbsolutePath() + "/";

		int file_seq = 0;
		int version = 0;
		String file_type = "";
		String contractId = "";
		
		// Remove extension from filename
		String fileNameNoExt = fileName.replaceAll("\\.zip", "");
		
		// Wait for rules
		waitForRulesLoaded();

		// check if filename matches pattern and obtain sequence
		String regex = env.getProperty("file.pattern.regex");
		Pattern pattern = Pattern.compile(regex);
		Matcher matcher = pattern.matcher(fileName);
		if (matcher.find()) {
			contractId = matcher.group(1);
			file_seq = Integer.parseInt(matcher.group(7));
			file_type = matcher.group(5);
			version = Integer.parseInt(matcher.group(6));
		} else
			return;  // ver que se hace si no hay matcheo, se ignora el archivo totalmente

		// check if 30 secs passed from lastModified time (prevent read file while creating)
		try {
			long lastModified = getLastAccessTime(inputFilePath.getPath());
			long now = new Date().getTime();
			long diff = (now - lastModified) / 1000;

			if (diff < 30) {
				// Ignore file maybe still in creation stage, will be took in
				// next round
				return;
			}
		} catch (IOException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}

		
		// Look for the filename in file_entries table. 
		// If already processed then move input file to folder and then skip it
		if (file_repo.findByFilename(fileNameNoExt).size() > 0) {
			// Move files and abort process
			FileProcessorHelper.MoveFiles(
					INPUT_FOLDER, 
					env.getProperty("input.folder.unzipped"), 
					env.getProperty("duplicate.folder"),
					fileNameNoExt);
			return;
		}


		try {
			// unzip filename on the fly
			unzipFile(fileName);

			// Lauch processing job
			JobParametersBuilder jobParametersBuilder = new JobParametersBuilder();
			jobParametersBuilder.addString("input_folder", INPUT_FOLDER);
			jobParametersBuilder.addString("unzipped_folder", env.getProperty("unzipped.folder"));
			jobParametersBuilder.addString("output_folder", env.getProperty("output.folder"));
			jobParametersBuilder.addString("history_folder", env.getProperty("history.folder"));
			jobParametersBuilder.addString("filename", fileNameNoExt);
			jobParametersBuilder.addString("contractId", contractId);
			jobParametersBuilder.addString("filetype", file_type);
			jobParametersBuilder.addLong("sequence", (long) file_seq);
			jobParametersBuilder.addLong("version", (long) version);
			jobParametersBuilder.addLong("time", System.currentTimeMillis());
			jobLauncher.run(job, jobParametersBuilder.toJobParameters());

		} catch (JobExecutionAlreadyRunningException | JobRestartException | JobInstanceAlreadyCompleteException
				| JobParametersInvalidException | IOException e) {
			// TODO Auto-generated catch block
//			e.printStackTrace();
		}

		// System.out.println(String.format(MSG, fileName, content));
	}

	
	
	private void waitForRulesLoaded() {
		while (ruleManager.getRules() == null) {
			// wait for rules be loaded from database
			try {
				Thread.sleep(1000);
			} catch (InterruptedException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	}

	public long getLastAccessTime(String filePath) throws IOException {
		File f = new File(filePath);
		BasicFileAttributes basicFileAttributes = Files.getFileAttributeView(f.toPath(), BasicFileAttributeView.class)
				.readAttributes();
		return basicFileAttributes.lastModifiedTime().toMillis();

	}

	
	private void unzipFile(String fileName) throws IOException {
		// TODO Auto-generated method stub
        final String fileZip = inputFilePath.getAbsolutePath();
        final byte[] buffer = new byte[1024];
        final ZipInputStream zis = new ZipInputStream(new FileInputStream(fileZip));
        ZipEntry zipEntry = zis.getNextEntry();
        while(zipEntry != null){
            final String fname = zipEntry.getName();
            final File newFile = new File(env.getProperty("unzipped.folder") + fname);
            final FileOutputStream fos = new FileOutputStream(newFile);
            int len;
            while ((len = zis.read(buffer)) > 0) {
                fos.write(buffer, 0, len);
            }
            fos.close();
            zipEntry = zis.getNextEntry();
        }
        zis.closeEntry();
        zis.close();
	}

}