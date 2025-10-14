package drej.sistema.boletas.config;

import drej.sistema.boletas.models.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.*;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    private final SecretKey secretKey;
    private final long expirationMillis;
    private final String tokenPrefix;
    private final String headerName;
    private final PasswordEncoder passwordEncoder;

    public JwtUtil(
            @Value("${security.jwt.secret}") String secret,
            @Value("${security.jwt.expiration}") long expirationMillis,
            @Value("${security.jwt.prefix}") String tokenPrefix,
            @Value("${security.jwt.header}") String headerName,
            PasswordEncoder passwordEncoder
    ) {
        // Si quieres usar Base64: byte[] keyBytes = Decoders.BASE64.decode(secret);
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMillis = expirationMillis;
        this.tokenPrefix = tokenPrefix;
        this.headerName = headerName;
        this.passwordEncoder = passwordEncoder;
    }

    public String generateToken(Usuario usuario) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + expirationMillis);

        return Jwts.builder()
                .setSubject(usuario.getCorreo())
                .claim("rol", usuario.getRol())
                .claim("uid", usuario.getId())
                .claim("dni", usuario.getDni())
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(secretKey, SignatureAlgorithm.HS512)
                .compact();
    }

    public boolean validateToken(String rawToken) {
        try {
            parseClaims(rawToken);
            return true;
        } catch (ExpiredJwtException e) {
            // log.warn("Token expirado", e);
        } catch (JwtException | IllegalArgumentException e) {
            // log.warn("Token inválido", e);
        }
        return false;
    }

    public Claims getClaims(String rawToken) {
        return parseClaims(rawToken);
    }

    public String extractCorreo(String rawToken) {
        return parseClaims(rawToken).getSubject();
    }

    public String extractRol(String rawToken) {
        return parseClaims(rawToken).get("rol", String.class);
    }

    public Long extractUserId(String rawToken) {
        return parseClaims(rawToken).get("uid", Long.class);
    }

    public boolean isAdmin(String rawToken) {
        return "ADMIN".equalsIgnoreCase(extractRol(rawToken));
    }

    public String getAuthorizationHeaderName() {
        return headerName;
    }

    public String getTokenPrefix() {
        return tokenPrefix;
    }

    public PasswordEncoder passwordEncoder() {
        return passwordEncoder;
    }

    private Claims parseClaims(String tokenWithOptionalPrefix) {
        String token = stripPrefix(tokenWithOptionalPrefix);
        return Jwts.parser()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private String stripPrefix(String token) {
        if (token == null) return "";
        String trimmed = token.trim();
        if (trimmed.startsWith(tokenPrefix + " ")) {
            return trimmed.substring((tokenPrefix + " ").length());
        }
        return trimmed;
    }
}