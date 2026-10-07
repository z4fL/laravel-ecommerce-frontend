import { ApiError } from './api'
import { listPublicProducts, useListPublicProducts } from './generated/products/products'

function App() {
  // const { data, error, isPending } = useListPublicProducts<
  //   Awaited<ReturnType<typeof listPublicProducts>>,
  //   ApiError
  // >({ per_page: 1 })

  // const status = isPending
  //   ? 'Requesting GET /products...'
  //   : error
  //     ? error.message
  //     : data
  //       ? `GET /products returned HTTP ${data.status}.`
  //       : 'No API response.'

  return (
    <main>
      <h1 className="text-3xl font-bold underline">API integration smoke test</h1>
      {/* <p role={error ? 'alert' : 'status'}>{status}</p> */}
    </main>
  )
}

export default App
