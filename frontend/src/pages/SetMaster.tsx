const SetMaster: React.FC = () => {
  return (
    <div className="min-h-screen bg-sky-100 flex flex-col items-center text-center px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-sky-800 mb-2">
          Welcome to Fortify
        </h1>
        <p className="text-lg text-gray-700 max-w-xl">
          Fortify requires a master password for encryption. You will be
          required to enter the master password while entering your vault every
          time. Please make it a secure one.
        </p>
      </div>

      <div className="flex-grow flex items-center justfiy-center">
        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
          <form className="space-y-4">
            <input
              type="password"
              name="masterPassword"
              placeholder="Master Password"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-sky-500"
              required
            />

            <input
              type="password"
              name="confirmMasterPassword"
              placeholder="Confirm Master Password"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-sky-500"
              required
            />

            <button
              type="submit"
              className="w-full bg-sky-700 text-white py-2 rounded hover:bg-sky-800 transition"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetMaster;
