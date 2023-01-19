import { ModalCloseButton } from '@chakra-ui/modal'
import {
  Button,
  Checkbox,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react'
import { useToast } from '@chakra-ui/toast'
import type { KeepKeyHDWallet } from '@shapeshiftoss/hdwallet-keepkey'
import { AwaitKeepKey } from 'components/Layout/Header/NavBar/KeepKey/AwaitKeepKey'
import { Text } from 'components/Text'
import { useKeepKey } from 'context/WalletProvider/KeepKeyProvider'
import { ipcListeners } from 'electron-shim'
import { useWallet } from 'hooks/useWallet/useWallet'
import { logger } from 'lib/logger'
import type { FC } from 'react'
import { useRef, useState } from 'react'
import { useTranslate } from 'react-polyglot'

const moduleLogger = logger.child({
  namespace: ['Layout', 'Header', 'NavBar', 'KeepKey', 'Modals', 'Wipe'],
})

export type KeepKeyWipeType = {
  onClose?: any
}

export const KeepKeyWipe: FC<KeepKeyWipeType> = ({ onClose }) => {
  const initRef = useRef<HTMLInputElement | null>(null)
  const { disconnect } = useWallet()
  const translate = useTranslate()

  const {
    state: {
      wallet,
      deviceState: { awaitingDeviceInteraction },
    },
  } = useWallet()
  const toast = useToast()
  const [wipeConfirmationChecked, setWipeConfirmationChecked] = useState(false)

  const wipeDevice = async () => {
    moduleLogger.trace({ fn: 'wipeDevice' }, 'Wiping KeepKey...')
    try {
      if (onClose && wallet) {
        await wallet.cancel()
        await wallet.wipe()
      } else ipcListeners.wipeKeepKey()
      disconnect()
      onClose && onClose()
    } catch (e) {
      moduleLogger.error(e, { fn: 'wipeDevice' }, 'KeepKey Wipe Failed')
      toast({
        title: translate('common.error'),
        description: (e as { message: string })?.message ?? translate('common.somethingWentWrong'),
        status: 'error',
        isClosable: true,
      })
    }
  }

  return (
    <>
      <ModalOverlay />
      <ModalContent justifyContent='center' px={3} pt={3} pb={6}>
        <ModalHeader>
          <Text translation={'walletProvider.keepKey.modals.headings.wipeKeepKey'} />
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text
            color='gray.500'
            translation={'walletProvider.keepKey.modals.descriptions.wipeKeepKey'}
            mb={6}
          />
          <Checkbox
            isChecked={wipeConfirmationChecked}
            onChange={e => setWipeConfirmationChecked(e.target.checked)}
            mb={6}
            spacing={3}
            ref={initRef}
            fontWeight='semibold'
          >
            {translate('walletProvider.keepKey.modals.checkboxes.wipeKeepKey')}
          </Checkbox>
          <Button
            onClick={wipeDevice}
            colorScheme='red'
            width='full'
            mb={6}
            isLoading={awaitingDeviceInteraction}
            disabled={!wipeConfirmationChecked}
          >
            {translate('walletProvider.keepKey.modals.actions.wipeDevice')}
          </Button>
        </ModalBody>
        <AwaitKeepKey
          translation={'walletProvider.keepKey.modals.confirmations.wipeKeepKey'}
          pl={6}
          pr={6}
        />
      </ModalContent>
    </>
  )
}