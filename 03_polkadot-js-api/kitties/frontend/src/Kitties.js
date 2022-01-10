import React, { useEffect, useState } from 'react'
import { Form, Grid } from 'semantic-ui-react'

import { useSubstrate } from './substrate-lib'
import { TxButton } from './substrate-lib/components'

import KittyCards from './KittyCards'

export default function Kitties (props) {
  const { api, keyring } = useSubstrate()
  const { accountPair } = props

  const [kitties, setKitties] = useState([])
  const [status, setStatus] = useState('')
  const [kittiesOwner, setKittiesOwner] = useState([])
  const [kittiesDna, setKittiesDna] = useState([])


  const fetchKitties = () => {
    let unsub = null

    const asyncFetch = async () => {
      unsub = await api.query.kittiesModule.kittiesCount(async cnt => {
        await api.query.kittiesModule.kitties.entries(async entries => {
          let kittiesDna = entries.map(([{ args: [era, nominatorId] }, value]) => [era.toHuman(), value]);
          setKittiesDna(kittiesDna);
        })
      })
    }

    asyncFetch()
    return () => {
      unsub && unsub()
    }
  }

  const populateKitties = () => {
    const kitties = []
    const kittiesIds = []
    for (let i = 0; i < kittiesDna.length; ++i) {
      const kitty = {}
      kitty.id = kittiesDna[i][0];
      kitty.dna = kittiesDna[i][1].unwrap()
      for (let j = 0; j < kittiesOwner.length; ++j) {
        if (kittiesOwner[j][0] == kittiesDna[i][0]){
          kitty.owner = kittiesOwner[j][1]
        }
      }
      kitties[i] = kitty
      kittiesIds.push(kitty.id)
    }
    setKitties(kitties)

    let unsub = null
    const asyncFetch = async () => {
        unsub = await api.query.kittiesModule.owner.multi(kittiesIds, async ret => {
          let owner = []
          for (let i = 0; i < kittiesIds.length; i++){
            owner.push([kittiesIds[i], ret[i].toHuman()])
          }
          setKittiesOwner(owner)
        })
    }


    asyncFetch()

    // return the unsubscription cleanup function
    return () => {
      unsub && unsub()
    }
  }

  useEffect(fetchKitties, [api, keyring])
  useEffect(populateKitties, [keyring,  kittiesDna, kittiesOwner])

  return <Grid.Column width={16}>
    <h1>小毛孩</h1>
    <KittyCards kitties={kitties} accountPair={accountPair} setStatus={setStatus}/>
    <Form style={{ margin: '1em 0' }}>
      <Form.Field style={{ textAlign: 'center' }}>
        <TxButton
          accountPair={accountPair} label='创建小毛孩' type='SIGNED-TX' setStatus={setStatus}
          attrs={{
            palletRpc: 'kittiesModule',
            callable: 'create',
            inputParams: [],
            paramFields: []
          }}
        />
      </Form.Field>
    </Form>
    <div style={{ overflowWrap: 'break-word' }}>{status}</div>
  </Grid.Column>
}
