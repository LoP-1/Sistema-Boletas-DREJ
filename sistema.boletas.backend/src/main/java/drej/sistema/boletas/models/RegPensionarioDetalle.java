package drej.sistema.boletas.models;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class RegPensionarioDetalle {

    @Column(length = 512)
    private String raw;

    private String afiliacion;

}
