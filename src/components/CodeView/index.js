import {useCallback, useEffect, useState} from "react";
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

ancestor(X,Y) :- parent(X, Y).
ancestor(X,Y) :- parent(Z, Y), ancestor(X,Z).`
const script = [
    {label:'parent(X,Y)',onHover:[26,27]},
    {label:'child(X,Y)',onHover:[29]},
    {label:'ancestor(X,Y)',onHover:[31,32]},
]
export default function() {
    const [codeline,setCodeline] = useState([]);
    const [codeHighlight,setCodeHighlight] = useState({});
    useEffect(()=>{
        // analyze
        const lines = codeData.split('\n')
            .map((text,id)=>{
                const item = {id, text};
                const _text = text.trim();
                if (_text.match(/^%/))
                    item.type = 'commment';
                else if (text===''){
                    item.type = 'blank';
                }else{
                    const splitRule = text.split(':-');
                    if (splitRule.length>1) {
                        item.type = 'rule';
                        item.label = splitRule[0].trim();
                        item.condition = [];
                        let count = 0;
                        splitRule[1].replace('.','').split(/([(,)])/).forEach(s=>{

                        })
                        splitRule[1].replace('.','').split(/([()])/).map(d=>d.trim());
                    }else {
                        const splitDefine = text.split('(');
                        if (splitDefine.length > 1) {
                            item.type = 'fact';
                            item.label = splitDefine[0].trim();
                            item.atom = text.split(`${splitDefine[0]}(`)[1].replace('.','').replace(')','').split(',').map(d => d.trim());
                        }
                    }
                }
                return item;
            })
        console.log(lines)
        setCodeline(lines);
    },[])
    const highlight = useCallback((list)=>{
        return ()=>{
            const hlist = {};
            list.forEach(d=>hlist[d]=1);
            setCodeHighlight(hlist);
        }
    },[codeline,script])
    const generateTree = useCallback((label)=>{
        return ()=>{

            // replace special symbol
            const _label = label.replace('(',"\\(").replace(')',"\\)")
            // find rule
            const rules = [];
            codeline.forEach((d,i)=> {
                if (d.match(`${_label} :-`))
                    rules.push([i,d])
            });
            debugger
            console.log(rules)
        }
    },[codeline])
    return <Grid container sx={{height:'calc(100% - 66px)',overflow:'hidden'}}>
        <Grid item xs={3} sx={{borderRight:1,padding:1}} className={"shadow"}>
            <Stack spacing={1}>
                {script.map((s,i)=><Chip key={i} 
                label={s.label} 
                onMouseEnter={highlight(s.onHover??[])}
                onMouseLeave={highlight([])}
                onClick={generateTree(s.label)}
                clickable/>)}
            </Stack>
        </Grid>
        <Grid item xs={9} sx={{padding:1,overflow:'auto',height:'100%'}}>
            <Stack sx={{display:'table', width:'100%'}} spacing={1}>
                {codeline.map(({text,id})=><Box key={id}
                sx={{display:'table-row', width:'auto', clear:'both', position:"relative"}}
                >
                    <Box sx={{position:'absolute',width:'100%',height:'100%',opacity:0.2, borderRadius:1}}
                    bgcolor={(theme)=>codeHighlight[id]?theme.palette.secondary.light:null}/>
                    <Box sx={{float:'left', display:'table-column', width:50, textAlign:'right',
                        userSelect:'none',paddingRight:1,borderRight:1}}>{id}</Box>
                    <Box sx={{float:'left', display:'table-column', width:'auto',paddingLeft:1}}>{text}</Box>
                </Box>)}
            </Stack>
        </Grid>
    </Grid>
}