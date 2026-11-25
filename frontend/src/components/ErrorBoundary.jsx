/* Atrapa errores de render de los hijos y muestra un fallback en vez de una
   pantalla en blanco. Tiene que ser componente de clase: getDerivedStateFromError
   y componentDidCatch no tienen equivalente en hooks. */
import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hayError: false };
  }

  static getDerivedStateFromError() {
    return { hayError: true };
  }

  // Punto para enviar el error a un servicio de logging; por ahora va a consola.
  componentDidCatch(error) {
    console.error("Error capturado por ErrorBoundary:", error.message);
  }

  reiniciar = () => {
    this.setState({ hayError: false });
  };

  render() {
    if (this.state.hayError) {
      return (
        <section className="container py-5 text-center" role="alert">
          <h2 className="fw-bold text-uppercase">Algo salió mal</h2>
          <p className="text-muted">Ocurrió un error inesperado al mostrar esta sección.</p>
          <button type="button" className="btn btn-dark rounded-0 fw-bold" onClick={this.reiniciar}>
            REINTENTAR
          </button>
        </section>
      );
    }
    return this.props.children;
  }
}
