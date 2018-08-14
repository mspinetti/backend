package nl.sonabusiness.mediator.model.repos;

import java.util.List;

import javax.persistence.NamedQuery;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Component;

import nl.sonabusiness.mediator.model.FileEntry;

import javax.persistence.NamedStoredProcedureQuery;

@Component
@RepositoryRestResource
public interface FileEntryRepository extends PagingAndSortingRepository<FileEntry, Long> {
	
	Page findAllByOrderBySequenceDesc(Pageable pageable);
	List<FileEntry> findAllByOrderBySequenceDesc();
	List<FileEntry> findByFilename(String filename);
	
}
