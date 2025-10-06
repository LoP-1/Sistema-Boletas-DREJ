package drej.sistema.boletas.models;

import jakarta.persistence.*;

@Entity
@Table(name = "concepto")
public class Concepto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tipo; // ingreso o descuento
    private String concepto;
    private Double monto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "boleta_id")
    private Boleta boleta;
}
