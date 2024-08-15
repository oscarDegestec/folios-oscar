import React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import TablaFolios from "./TablaFolios";


const Colapsible = ({ folios }) => {
  return (
    <div>
      {folios.length > 0 &&
        folios.map(folio => (
          <Accordion key={1}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              Premio de ${folio.valor}
            </AccordionSummary>
            <AccordionDetails>
              <TablaFolios rows={folio.folios} />
            </AccordionDetails>
          </Accordion>
        ))}
    </div >
  );
}

export default Colapsible