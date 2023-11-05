import {useEffect, useState} from "react";
import {Box, Stack} from "@mui/material";

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
parent(X, Y) :- mother(X,Y).

child(X, Y) :- parent(Y, X).

acncestor(X,Y) :- parent(X, Y),
acncestor(X,Y) :- parent(Z, Y), ancestor(X,Z)`
export default function() {
    const [codeline,setCodeline] = useState([]);
    useEffect(()=>{
        setCodeline(codeData.split('\n'));
    },[])
    return <Stack sx={{display:'table', width:'100%'}} spacing={1}>
        {codeline.map((d,i)=><Box sx={{display:'table-row', width:'auto', clear:'both'}}>
            <Box sx={{float:'left', display:'table-column', width:50, textAlign:'right',paddingRight:1,borderRight:1}}>{i}</Box>
            <Box sx={{float:'left', display:'table-column', width:'auto',paddingLeft:1}}>{d}</Box>
        </Box>)}
    </Stack>
}