// app/join/page.tsx

export default function JoinPage() {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <h1 className="text-3xl font-bold">
          Welcome! Join or Create a Home.
        </h1>
        <p> Enter Join Code</p>
        <input placeholder="Enter 6 character code" />
        <p> Create a Home </p>
        <button> Create </button>
        {/* You can build out your join/create group UI here */}
      </div>
    )
  }