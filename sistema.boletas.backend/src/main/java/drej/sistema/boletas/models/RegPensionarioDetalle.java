package drej.sistema.boletas.models;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class RegPensionarioDetalle {

    @Column(length = 512)
    private String raw;

    private String afiliacion;

    // Getters y setters


    public String getAfiliacion() {
        return afiliacion;
    }

    public void setAfiliacion(String afiliacion) {
        this.afiliacion = afiliacion;
    }

    public String getRaw() {
        return raw;
    }

    public void setRaw(String raw) {
        this.raw = raw;
    }
}
