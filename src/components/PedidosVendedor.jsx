import React, { useState } from 'react';
import { usePedidosVendedor } from '../hooks/usePedidosVendedor';
import { Card, Button, Alert, Spinner, Badge, Row, Col, Modal } from 'react-bootstrap';
import { FaBox, FaShippingFast, FaCheck, FaTimes, FaInfoCircle } from 'react-icons/fa';
import EstadoPedido from './common/EstadoPedido';
import { useTheme } from '../context/ContextoTema';

/**
 * Componente que muestra los pedidos que contienen productos vendidos por el usuario actual
 * y permite actualizar su estado
 */
const PedidosVendedor = () => {
    const { isDarkMode } = useTheme();
    const { 
        pedidos, 
        cargando, 
        error, 
        actualizando,
        cargarPedidos, 
        actualizarEstado, 
        formatearFecha,
        hayPedidos 
    } = usePedidosVendedor({ cargarAlInicio: true });

    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [nuevoEstado, setNuevoEstado] = useState('');
    const [mensajeExito, setMensajeExito] = useState('');

    const abrirModalEstado = (pedido) => {
        setPedidoSeleccionado(pedido);
        setNuevoEstado('');
        setMostrarModal(true);
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setPedidoSeleccionado(null);
    };

    const handleActualizarEstado = async () => {
        if (!pedidoSeleccionado || !nuevoEstado) return;
        
        const resultado = await actualizarEstado(pedidoSeleccionado.id, nuevoEstado);
        
        if (resultado.success) {
            setMensajeExito(`El pedido #${pedidoSeleccionado.id} ha sido actualizado a ${nuevoEstado}`);
            setTimeout(() => setMensajeExito(''), 5000);
            cerrarModal();
        }
    };

    const getEstadoOptions = (estadoActual) => {
        const estados = ['pendiente', 'procesando', 'completado', 'cancelado'];
        // Filtrar el estado actual para no mostrarlo como opción
        return estados.filter(estado => estado !== estadoActual);
    };

    if (cargando) {
        return (
            <div className="text-center my-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Cargando pedidos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger" className="my-3">
                <FaTimes className="me-2" />
                {error}
            </Alert>
        );
    }

    if (!hayPedidos) {
        return (
            <Alert variant="info" className="my-3">
                <FaInfoCircle className="me-2" />
                No tienes pedidos con tus productos vendidos.
            </Alert>
        );
    }

    return (
        <div className="pedidos-vendedor-container">
            {mensajeExito && (
                <Alert variant="success" className="my-3">
                    <FaCheck className="me-2" />
                    {mensajeExito}
                </Alert>
            )}
            
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3>Pedidos con tus productos</h3>
                <Button 
                    variant="outline-primary" 
                    onClick={cargarPedidos}
                    disabled={actualizando}
                >
                    {actualizando ? (
                        <>
                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                            <span className="ms-2">Actualizando...</span>
                        </>
                    ) : 'Actualizar lista'}
                </Button>
            </div>

            {pedidos.map((pedido) => (
                <Card key={pedido.id} className="mb-4 shadow-sm">
                    <Card.Header className={`d-flex justify-content-between align-items-center ${isDarkMode ? 'bg-dark text-light' : 'bg-light'}`}>
                        <div>
                            <span className="fw-bold">Pedido #{pedido.id}</span>
                            <span className={`ms-3 ${isDarkMode ? 'text-light-50' : 'text-muted'}`}>
                                {formatearFecha(pedido.fecha_pedido, true)}
                            </span>
                        </div>
                        <EstadoPedido estado={pedido.estado} />
                    </Card.Header>
                    
                    <Card.Body>
                        <h5>Productos vendidos por ti en este pedido:</h5>
                        {pedido.items.map((item) => (
                            <Row key={item.id} className="mb-2 align-items-center">
                                <Col xs={2} md={1}>
                                    {item.imagen ? (
                                        <img 
                                            src={item.imagen} 
                                            alt={item.nombre} 
                                            className="img-fluid rounded"
                                            style={{ maxWidth: '50px', maxHeight: '50px' }}
                                        />
                                    ) : (
                                        <div className={`${isDarkMode ? 'bg-dark' : 'bg-light'} rounded d-flex justify-content-center align-items-center`} 
                                            style={{ width: '50px', height: '50px' }}>
                                            <FaBox className={isDarkMode ? 'text-light' : ''} />
                                        </div>
                                    )}
                                </Col>
                                <Col>
                                    <div className="fw-bold">{item.nombre}</div>
                                    <div className={`${isDarkMode ? 'text-light-50' : 'text-muted'} small`}>
                                        Cantidad: {item.cantidad} x ${parseFloat(item.precio_unitario).toFixed(2)}
                                    </div>
                                </Col>
                                <Col xs={3} md={2} className="text-end">
                                    <Badge bg="secondary">${(item.cantidad * parseFloat(item.precio_unitario)).toFixed(2)}</Badge>
                                </Col>
                            </Row>
                        ))}
                        
                        <div className="d-flex justify-content-between mt-4">
                            <div>
                                <strong>Cliente:</strong> {pedido.comprador_nombre}
                            </div>
                            <div>
                                <Button 
                                    variant="primary" 
                                    onClick={() => abrirModalEstado(pedido)}
                                    disabled={pedido.estado === 'entregado' || pedido.estado === 'cancelado'}
                                >
                                    {pedido.estado === 'entregado' || pedido.estado === 'cancelado' ? (
                                        'Pedido finalizado'
                                    ) : (
                                        <>
                                            <FaShippingFast className="me-2" />
                                            Actualizar estado
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            ))}

            {/* Modal para actualizar estado */}
            <Modal show={mostrarModal} onHide={cerrarModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Actualizar estado del pedido</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {pedidoSeleccionado && (
                        <>
                            <p>Pedido #{pedidoSeleccionado.id}</p>
                            <p>Estado actual: <EstadoPedido estado={pedidoSeleccionado.estado} /></p>
                            
                            <div className="mb-3">
                                <label htmlFor="nuevoEstado" className="form-label">Selecciona el nuevo estado:</label>
                                <select 
                                    id="nuevoEstado"
                                    className="form-select" 
                                    value={nuevoEstado} 
                                    onChange={(e) => setNuevoEstado(e.target.value)}
                                >
                                    <option value="">Seleccionar estado...</option>
                                    {getEstadoOptions(pedidoSeleccionado.estado).map(estado => (
                                        <option key={estado} value={estado}>
                                            {estado.charAt(0).toUpperCase() + estado.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={cerrarModal}>
                        Cancelar
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleActualizarEstado}
                        disabled={!nuevoEstado || actualizando}
                    >
                        {actualizando ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                <span className="ms-2">Actualizando...</span>
                            </>
                        ) : 'Guardar cambios'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default PedidosVendedor;