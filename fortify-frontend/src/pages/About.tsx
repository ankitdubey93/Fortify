import Navbar from "../components/navbar";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-sky-300">
      <Navbar />
      <div className="max-w-3xl mx-auto mt-16 px-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">About Fortify</h1>
        <p className="text-lg text-gray-700">
          Fortify is an open-source password manager designed with security in
          mind. Built with Node.js, TypeScript, MongoDB, and secure hashing
          techniques, Fortify ensures your data is safe from end to end.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
