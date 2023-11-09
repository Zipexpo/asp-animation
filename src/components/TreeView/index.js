import React, {useCallback} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function({data,root,open,onClose}){
    const generateTree = useCallback((parent,atom)=>{
        return ()=>{
            // find rule
            const rules = [];
            find_child(parent,parent.type)
            function find_child(parent,type){
                if (type==='rule'){
                    debugger
                    data.forEach((d,i)=> {
                        if ((d.type==='rule') && (d.label===parent.label)){
                            rules.push({parent,children:d});
                            find_child(d,d.type)
                        }
                    });
                }else
                    return rules;
            }
        }
    },[data])
    return <React.Fragment>
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="responsive-dialog-title"
    >
      <DialogTitle id="responsive-dialog-title">
        {"Firing View"}
      </DialogTitle>
      <DialogContent>
        {root&&<DialogContentText>
          {root.label}
        </DialogContentText>}
      </DialogContent>
    </Dialog>
  </React.Fragment>
}