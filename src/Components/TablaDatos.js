import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';


const TablaDatos = ({ data, folios, denominaciones }) => {
  const { nombreSorteo, permisoSorteo, vigenciaSorteo, numeroEmision, folioInicial, folioFinal, cantidad } = data

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 700 }} aria-label="spanning table">
        <TableBody>
          <TableRow>
            <TableCell>Nombre del sorteo</TableCell>
            <TableCell colSpan={2}>{nombreSorteo}</TableCell>
          </TableRow>

          <TableRow>
            <TableCell>Permiso</TableCell>
            <TableCell colSpan={2}>{permisoSorteo}</TableCell>
          </TableRow>

          <TableRow>
            <TableCell rowSpan={2}>Vigencia</TableCell>
            <TableCell>Del</TableCell>
            <TableCell>Al</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>{vigenciaSorteo.inicio}</TableCell>
            <TableCell>{vigenciaSorteo.fin}</TableCell>
          </TableRow>

          <TableRow>
            <TableCell>Emisión</TableCell>
            <TableCell colSpan={2}>{numeroEmision}</TableCell>
          </TableRow>

          <TableRow>
            <TableCell rowSpan={2}>Folios</TableCell>
            <TableCell>Del</TableCell>
            <TableCell>Al</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>{folioInicial}</TableCell>
            <TableCell>{folioFinal}</TableCell>
          </TableRow>

          <TableRow>
            <TableCell colSpan={2}>Cantidad de boletos premiados</TableCell>
            <TableCell>{cantidad}</TableCell>
          </TableRow>

          <TableRow>
            <TableCell colSpan={2}>Cantidad de boletos no premiados</TableCell>
            <TableCell>{folioFinal - cantidad}</TableCell>
          </TableRow>

          <TableRow>
            <TableCell rowSpan={denominaciones.length + 1}>Estructura de premios</TableCell>
            <TableCell>Denominación</TableCell>
            <TableCell>Cantidad</TableCell>
          </TableRow>

          {denominaciones.map((denominacion) => (
            <TableRow key={denominacion.valor}>
              <TableCell>{denominacion.valor}</TableCell>
              <TableCell align="right">{denominacion.cantidad}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default TablaDatos
