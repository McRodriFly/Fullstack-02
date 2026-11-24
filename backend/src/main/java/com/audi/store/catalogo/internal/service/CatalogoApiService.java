package com.audi.store.catalogo.internal.service;

import com.audi.store.catalogo.api.CatalogoApi;
import com.audi.store.catalogo.api.ProductoResumen;
import com.audi.store.catalogo.api.StockInsuficienteException;
import com.audi.store.catalogo.internal.domain.Producto;
import com.audi.store.catalogo.internal.repository.ProductoRepository;
import com.audi.store.shared.error.RecursoNoEncontradoException;
import com.audi.store.shared.error.SolicitudInvalidaException;
import java.util.Collection;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/** Implementación de la fachada del catálogo para los demás módulos. */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
class CatalogoApiService implements CatalogoApi {

    private final ProductoRepository productoRepository;

    @Override
    public ProductoResumen obtenerProducto(Long id) {
        return productoRepository.findById(id)
                .map(CatalogoApiService::resumen)
                .orElseThrow(() -> new RecursoNoEncontradoException("El producto " + id + " no existe"));
    }

    @Override
    public List<ProductoResumen> obtenerProductos(Collection<Long> ids) {
        return productoRepository.findAllById(ids).stream()
                .map(CatalogoApiService::resumen)
                .toList();
    }

    // MANDATORY: sin una transacción del llamador el bloqueo se soltaría al volver de este método
    // y el descuento no se desharía si la compra falla después.
    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public ProductoResumen descontarStock(Long productoId, int cantidad) {
        if (cantidad <= 0) {
            throw new SolicitudInvalidaException("La cantidad debe ser mayor que cero");
        }
        Producto producto = productoRepository.buscarParaActualizarStock(productoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("El producto " + productoId + " no existe"));
        if (producto.getStock() < cantidad) {
            throw new StockInsuficienteException(productoId, cantidad, producto.getStock());
        }
        producto.setStock(producto.getStock() - cantidad);
        return resumen(producto);
    }

    private static ProductoResumen resumen(Producto p) {
        return new ProductoResumen(p.getId(), p.getNombre(), p.precioVigente(), p.getStock());
    }
}
