import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Skeleton,
  Stat,
  StatArrow,
  StatGroup,
  StatNumber,
} from '@chakra-ui/react'
import type { AssetId } from '@shapeshiftoss/caip'
import type { HistoryTimeframe } from '@shapeshiftoss/types'
import { BalanceChart } from 'components/BalanceChart/BalanceChart'
import { Card } from 'components/Card/Card'
import { TimeControls } from 'components/Graph/TimeControls'
import { PriceChart } from 'components/PriceChart/PriceChart'
import { RawText, Text } from 'components/Text'
import { DEFAULT_HISTORY_TIMEFRAME } from 'constants/Config'
import { useLocaleFormatter } from 'hooks/useLocaleFormatter/useLocaleFormatter'
import { bnOrZero } from 'lib/bignumber/bignumber'
import { useEffect, useMemo, useState } from 'react'
import NumberFormat from 'react-number-format'
import type { AccountSpecifier } from 'state/slices/accountSpecifiersSlice/accountSpecifiersSlice'
import {
  selectAssetById,
  selectCryptoHumanBalanceByFilter,
  selectFiatBalanceByFilter,
  selectMarketDataById,
} from 'state/slices/selectors'
import { useAppSelector } from 'state/store'

import { useIsBalanceChartDataUnavailable } from '../../hooks/useBalanceChartData/utils'

enum View {
  Price = 'price',
  Balance = 'balance',
}

type AssetChartProps = {
  accountId?: AccountSpecifier
  assetId: AssetId
  isLoaded: boolean
}

export const AssetChart = ({ accountId, assetId, isLoaded }: AssetChartProps) => {
  const {
    number: { toFiat },
  } = useLocaleFormatter()
  const [percentChange, setPercentChange] = useState(0)
  const [timeframe, setTimeframe] = useState<HistoryTimeframe>(DEFAULT_HISTORY_TIMEFRAME)
  const assetIds = useMemo(() => [assetId].filter(Boolean), [assetId])
  const asset = useAppSelector(state => selectAssetById(state, assetId))
  const marketData = useAppSelector(state => selectMarketDataById(state, assetId))
  const { price } = marketData || {}
  const assetPrice = toFiat(price) ?? 0
  const isBalanceChartDataUnavailable = useIsBalanceChartDataUnavailable(assetIds)
  const defaultView = accountId && !isBalanceChartDataUnavailable ? View.Balance : View.Price
  const [view, setView] = useState(defaultView)

  const filter = useMemo(() => ({ assetId, accountId }), [assetId, accountId])

  const fiatBalance = useAppSelector(s => selectFiatBalanceByFilter(s, filter))
  const cryptoHumanBalance = useAppSelector(s => selectCryptoHumanBalanceByFilter(s, filter))

  useEffect(() => {
    if (isBalanceChartDataUnavailable) return
    if (bnOrZero(fiatBalance).eq(0)) return
    setView(View.Balance)
  }, [fiatBalance, isBalanceChartDataUnavailable])

  return (
    <Card>
      <Card.Header>
        <Flex
          justifyContent={{ base: 'center', md: 'space-between' }}
          width='full'
          flexDir={{ base: 'column', md: 'row' }}
        >
          <Skeleton isLoaded={isLoaded} textAlign='center'>
            <ButtonGroup size='sm' colorScheme='blue' variant='ghost'>
              {!isBalanceChartDataUnavailable && (
                <Button isActive={view === View.Balance} onClick={() => setView(View.Balance)}>
                  <Text translation='assets.assetDetails.assetHeader.balance' />
                </Button>
              )}
              <Button isActive={view === View.Price} onClick={() => setView(View.Price)}>
                <Text translation='assets.assetDetails.assetHeader.price' />
              </Button>
            </ButtonGroup>
          </Skeleton>

          <Skeleton isLoaded={isLoaded} display={{ base: 'none', md: 'block' }}>
            <TimeControls onChange={setTimeframe} defaultTime={timeframe} />
          </Skeleton>
        </Flex>
        <Box width='full' alignItems='center' display='flex' flexDir='column' mt={6}>
          <Card.Heading fontSize='4xl' lineHeight={1} mb={2}>
            <Skeleton isLoaded={isLoaded}>
              <NumberFormat
                value={view === View.Price ? assetPrice : toFiat(fiatBalance)}
                displayType={'text'}
                thousandSeparator={true}
                isNumericString={true}
              />
            </Skeleton>
          </Card.Heading>
          <StatGroup>
            <Stat size='sm' display='flex' flex='initial' mr={2}>
              <Skeleton isLoaded={isLoaded}>
                <StatNumber
                  display='flex'
                  alignItems='center'
                  color={percentChange > 0 ? 'green.500' : 'red.500'}
                >
                  <StatArrow type={percentChange > 0 ? 'increase' : 'decrease'} />
                  {isFinite(percentChange) && <RawText>{percentChange}%</RawText>}
                </StatNumber>
              </Skeleton>
            </Stat>
            {view === View.Balance && (
              <Stat size='sm' color='gray.500'>
                <Skeleton isLoaded={isLoaded}>
                  <StatNumber>{`${cryptoHumanBalance} ${asset.symbol}`}</StatNumber>
                </Skeleton>
              </Stat>
            )}
          </StatGroup>
        </Box>
      </Card.Header>
      {view === View.Balance && marketData ? (
        <Box>
          <BalanceChart
            accountId={accountId}
            assetIds={assetIds}
            timeframe={timeframe}
            percentChange={percentChange}
            setPercentChange={setPercentChange}
            isRainbowChart={false}
          />
        </Box>
      ) : (
        <Box>
          <PriceChart
            assetId={assetId}
            timeframe={timeframe}
            percentChange={percentChange}
            setPercentChange={setPercentChange}
          />
        </Box>
      )}
      <Skeleton isLoaded={isLoaded} display={{ base: 'block', md: 'none' }}>
        <TimeControls
          onChange={setTimeframe}
          defaultTime={timeframe}
          buttonGroupProps={{
            display: 'flex',
            width: 'full',
            justifyContent: 'space-between',
            px: 6,
            py: 4,
          }}
        />
      </Skeleton>
    </Card>
  )
}
