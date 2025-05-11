package edu.icet.dto;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "ClassRequest")
public class ClassRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "class_id", nullable = false)
    private Class requestedClass;

    @Column(nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date requestDate;

    @Column(nullable = false)
    private String status; // "PENDING", "APPROVED", "REJECTED"

    @Temporal(TemporalType.TIMESTAMP)
    private Date responseDate;

    private String responseNotes;
}