package nl.sonabusiness.mediator.integration;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class FileProcessorHelper {
	
	private static final Logger log = LoggerFactory.getLogger(FileProcessorHelper.class);
	
	public static void MoveFiles(
			String input_folder_zip,
			String input_folder_unzipped,
			String history_folder,
			String filename) {
		
		Path inputFileName = Paths.get(input_folder_zip + filename + ".zip");
		Path sourceFileName = Paths.get(history_folder + filename + ".zip");
		Path csvFileName = Paths.get(input_folder_unzipped + filename + ".csv");
		Path infFileName = Paths.get(input_folder_unzipped + filename + ".inf");

		try {
			Files.move(inputFileName, sourceFileName, StandardCopyOption.REPLACE_EXISTING);
			Files.deleteIfExists(csvFileName);
			Files.deleteIfExists(infFileName);
			log.info("!!! Files {} moved", filename);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
	}

}
