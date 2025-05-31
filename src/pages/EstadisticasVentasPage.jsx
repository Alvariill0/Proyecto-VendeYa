import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { useAutenticacion } from '../context/ContextoAutenticacion';
import { Navigate } from 'react-router-dom';
import Chart from 'react-apexcharts';
import { usePedidosVendedor } from '../hooks/usePedidosVendedor';
import { useTheme } from '../context/ContextoTema';

/**
 * Página que muestra las estadísticas de ventas del usuario
 */
const EstadisticasVentasPage = () => {
    const { usuario, cargando: cargandoUsuario } = useAutenticacion();
    const { pedidos, cargando: cargandoPedidos, cargarPedidos } = usePedidosVendedor({
        ordenarPorRecientes: true,
        cargarAlInicio: true
    });
    const { isDarkMode } = useTheme();
    
    const [ventasPorMes, setVentasPorMes] = useState([]);
    const [productosMasVendidos, setProductosMasVendidos] = useState([]);

    // Redirigir si no hay usuario autenticado
    if (!cargandoUsuario && !usuario) {
        return <Navigate to="/login" replace />;
    }

    useEffect(() => {
        if (pedidos.length > 0) {
            procesarDatosEstadisticas();
        }
    }, [pedidos]);

    const procesarDatosEstadisticas = () => {
        // Procesar ventas por mes
        const ventasMensuales = procesarVentasPorMes(pedidos);
        setVentasPorMes(ventasMensuales);

        // Procesar productos más vendidos
        const topProductos = procesarProductosMasVendidos(pedidos);
        setProductosMasVendidos(topProductos);

        // La sección de valoraciones promedio ha sido eliminada
    };

    const procesarVentasPorMes = (pedidos) => {
        // Agrupar pedidos por mes
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const ventasPorMes = Array(12).fill(0);
        const ingresosPorMes = Array(12).fill(0);
        
        pedidos.forEach(pedido => {
            const fecha = new Date(pedido.fecha_pedido);
            const mes = fecha.getMonth();
            ventasPorMes[mes]++;
            
            // Calcular ingresos (precio total de los productos vendidos)
            if (pedido.items && pedido.items.length > 0) {
                pedido.items.forEach(item => {
                    ingresosPorMes[mes] += parseFloat(item.precio_unitario) * item.cantidad;
                });
            }
        });

        // Colores adaptados al tema
        const textColor = isDarkMode ? '#f8f9fa' : '#212529';
        const gridColor = isDarkMode ? '#495057' : '#e9e9e9';

        return {
            series: [
                {
                    name: 'Ventas',
                    type: 'column',
                    data: ventasPorMes
                },
                {
                    name: 'Ingresos (€)',
                    type: 'line',
                    data: ingresosPorMes.map(valor => parseFloat(valor.toFixed(2)))
                }
            ],
            options: {
                chart: {
                    height: 350,
                    type: 'line',
                    toolbar: {
                        show: false
                    },
                    foreColor: textColor
                },
                stroke: {
                    width: [0, 4]
                },
                title: {
                    text: 'Ventas e Ingresos Mensuales',
                    style: {
                        color: textColor
                    }
                },
                dataLabels: {
                    enabled: true,
                    enabledOnSeries: [1],
                    style: {
                        colors: [textColor]
                    }
                },
                labels: meses,
                xaxis: {
                    type: 'category',
                    labels: {
                        style: {
                            colors: Array(12).fill(textColor)
                        }
                    },
                    axisBorder: {
                        color: gridColor
                    },
                    axisTicks: {
                        color: gridColor
                    }
                },
                yaxis: [
                    {
                        title: {
                            text: 'Ventas',
                            style: {
                                color: textColor
                            }
                        },
                        labels: {
                            style: {
                                colors: [textColor]
                            }
                        }
                    },
                    {
                        opposite: true,
                        title: {
                            text: 'Ingresos (€)',
                            style: {
                                color: textColor
                            }
                        },
                        labels: {
                            style: {
                                colors: [textColor]
                            }
                        }
                    }
                ],
                grid: {
                    borderColor: gridColor
                },
                legend: {
                    labels: {
                        colors: textColor
                    }
                }
            }
        };
    };

    const procesarProductosMasVendidos = (pedidos) => {
        // Contar productos vendidos
        const productosVendidos = {};
        
        pedidos.forEach(pedido => {
            if (pedido.items && pedido.items.length > 0) {
                pedido.items.forEach(item => {
                    const id = item.producto_id;
                    if (!productosVendidos[id]) {
                        productosVendidos[id] = {
                            nombre: item.nombre || `Producto sin nombre`,
                            cantidad: 0
                        };
                    }
                    productosVendidos[id].cantidad += item.cantidad;
                });
            }
        });
        
        // Convertir a array y ordenar por cantidad
        const productosArray = Object.values(productosVendidos);
        productosArray.sort((a, b) => b.cantidad - a.cantidad);
        
        // Tomar los 5 más vendidos
        const top5 = productosArray.slice(0, 5);
        
        // Colores adaptados al tema
        const textColor = isDarkMode ? '#f8f9fa' : '#212529';
        const gridColor = isDarkMode ? '#495057' : '#e9e9e9';
        const barColor = isDarkMode ? '#0d6efd' : '#33b2df';
        
        return {
            series: [{
                data: top5.map(p => p.cantidad)
            }],
            options: {
                chart: {
                    type: 'bar',
                    height: 350,
                    toolbar: {
                        show: false
                    },
                    foreColor: textColor
                },
                plotOptions: {
                    bar: {
                        borderRadius: 4,
                        horizontal: true,
                        distributed: true,
                        barHeight: '80%',
                        colors: {
                            ranges: [{
                                from: 0,
                                to: 100,
                                color: barColor
                            }]
                        }
                    }
                },
                dataLabels: {
                    enabled: true,
                    style: {
                        colors: [textColor]
                    }
                },
                xaxis: {
                    categories: top5.map(p => p.nombre),
                    title: {
                        text: 'Unidades vendidas',
                        style: {
                            color: textColor
                        }
                    },
                    labels: {
                        style: {
                            colors: Array(top5.length).fill(textColor)
                        }
                    },
                    axisBorder: {
                        color: gridColor
                    },
                    axisTicks: {
                        color: gridColor
                    }
                },
                title: {
                    text: 'Productos Más Vendidos',
                    style: {
                        color: textColor
                    }
                },
                grid: {
                    borderColor: gridColor
                },
                legend: {
                    labels: {
                        colors: textColor
                    }
                }
            }
        };
    };

    return (
        <Container className="py-4">
            <h2 className="mb-4">Estadísticas de Ventas</h2>
            
            {cargandoPedidos ? (
                <div className="text-center my-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Cargando estadísticas...</p>
                </div>
            ) : pedidos.length === 0 ? (
                <Card className="mb-4">
                    <Card.Body className="text-center">
                        <Card.Title>No hay datos disponibles</Card.Title>
                        <Card.Text>
                            Aún no tienes ventas registradas para generar estadísticas.
                        </Card.Text>
                    </Card.Body>
                </Card>
            ) : (
                <Row>
                    <Col lg={8} className="mb-4">
                        <Card>
                            <Card.Body>
                                {ventasPorMes.series && (
                                    <Chart
                                        options={ventasPorMes.options}
                                        series={ventasPorMes.series}
                                        type="line"
                                        height={350}
                                    />
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col xs={12} className="mb-4">
                        <Card>
                            <Card.Body>
                                {productosMasVendidos.series && (
                                    <Chart
                                        options={productosMasVendidos.options}
                                        series={productosMasVendidos.series}
                                        type="bar"
                                        height={350}
                                    />
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default EstadisticasVentasPage;