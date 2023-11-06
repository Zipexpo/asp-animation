import './App.css';
import {Container, Card, Box, CardContent, IconButton, Divider} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CodeView from "./components/CodeView";

function App() {
  return (
      <Container maxWidth="md" sx={{padding:5}}>
          <Card sx={{width:'100%', height:'100%'}} elevation={5}>
              <CardContent sx={{display: 'flex'}}>
                  <Box sx={{flexGrow:1}}></Box>
                  <IconButton size={'small'}>
                      <InfoOutlinedIcon/>
                  </IconButton>
                  <IconButton size={'small'}>
                      <HelpOutlineIcon/>
                  </IconButton>
                  <IconButton size={'small'}>
                      <CloseIcon/>
                  </IconButton>
              </CardContent>
              <Divider/>
              <CodeView/>
          </Card>
      </Container>
  );
}

export default App;
