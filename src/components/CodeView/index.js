import {useEffect, useState} from "react";
import {Box, Stack, Grid} from "@mui/material";
import Chip from '@mui/material-next/Chip';
import "./index.css"

const codeData = `person (john). 
person(sam).
person(alice).
person(bill).
person(bob).
person(andy).
person(sarah).

gender(male).
gender(female).

father(john, sam).
father(john, bill).
father(bill, andy).

mother(alice, sam).
mother(alice, bill).
mother(sarah, andy).

gender_of(john, male).
gender_of(alice, female).
gender_of(sam, male).
gender_of(bill, male).
gender_of(andy, male).
gender_of(sarah, female).

parent(X,Y) :- father(X,Y).
parent(X,Y) :- mother(X,Y).

child(X,Y) :- parent(Y, X).

ancestor(X,Y) :- parent(X, Y),
ancestor(X,Y) :- parent(Z, Y), ancestor(X,Z)`
const script = [
    {label:'parent(X,Y)'},
    {label:'child(X,Y)'},
    {label:'ancestor(X,Y)'},
]
export default function() {
    const [codeline,setCodeline] = useState([]);
    useEffect(()=>{
        setCodeline(codeData.split('\n'));
    },[])
    return <Grid container>
        <Grid xs={3} sx={{borderRight:1,padding:1}} className={"shadow"}>
            <Stack spacing={1}>
                {script.map((s,i)=><Chip key={i} label={s.label} clickable/>)}
            </Stack>
        </Grid>
        <Grid xs={9} sx={{padding:1}}>
            <Stack sx={{display:'table', width:'100%'}} spacing={1}>
                {codeline.map((d,i)=><Box sx={{display:'table-row', width:'auto', clear:'both'}}>
                    <Box sx={{float:'left', display:'table-column', width:50, textAlign:'right',
                        userSelect:'none',paddingRight:1,borderRight:1}}>{i}</Box>
                    <Box sx={{float:'left', display:'table-column', width:'auto',paddingLeft:1}}>{d}</Box>
                </Box>)}
            </Stack>
        </Grid>
    </Grid>
}