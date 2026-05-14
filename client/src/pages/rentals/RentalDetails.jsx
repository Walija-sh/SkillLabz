import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import rentalService from "../../services/rental.service";
import { useSelector } from "react-redux";
import ContractView from "../../components/rentals/ContractView";

export default function RentalDetails() {
  const { id } = useParams();
  const userId = useSelector((state) => state.auth.userData?._id);
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [agreeError, setAgreeError] = useState("");
  const [agreeLoading, setAgreeLoading] = useState(false);

  useEffect(() => {
    const fetchRental = async () => {
      try {
        const response = await rentalService.getRentalById(id);
        setRental(response.rental);
      } catch (err) {
        setError(err?.message || "Failed to load rental details.");
      } finally {
        setLoading(false);
      }
    };
    fetchRental();
  }, [id]);

  const handleAgree = async () => {
    setAgreeError("");
    setAgreeLoading(true);
    try {
      const response = await rentalService.agreeContract(id);
      setRental(response.rental);
    } catch (err) {
      setAgreeError(err?.message || "Failed to confirm contract.");
    } finally {
      setAgreeLoading(false);
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-10">Loading...</div>;
  if (error || !rental) return <div className="max-w-4xl mx-auto px-4 py-10 text-red-600">{error || "Not found."}</div>;

  const ownerId = rental?.owner?._id || rental?.owner;
  const renterId = rental?.renter?._id || rental?.renter;
  const isRenter = String(renterId) === String(userId);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-gray-900">Rental Details</h1>
        <p className="text-sm text-gray-500 mt-1">
          Item:{" "}
          {rental?.item?._id ? (
            <Link to={`/items/${rental.item._id}`} className="text-blue-600 hover:underline">
              {rental.item?.title || "View item"}
            </Link>
          ) : (
            "Item unavailable"
          )}
        </p>
        <p className="text-sm text-gray-500">
          Owner:{" "}
          {ownerId ? (
            <Link to={`/users/${ownerId}`} className="text-blue-600 hover:underline">
              {rental?.owner?.username || rental?.owner?.fullName || "Owner"}
            </Link>
          ) : (
            "Deleted user"
          )}
          {" · "}
          Renter:{" "}
          {renterId ? (
            <Link to={`/users/${renterId}`} className="text-blue-600 hover:underline">
              {rental?.renter?.username || rental?.renter?.fullName || "Renter"}
            </Link>
          ) : (
            "Deleted user"
          )}
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Contract</h2>
        <ContractView
          rental={rental}
          isRenter={isRenter}
          onAgree={handleAgree}
          submitting={agreeLoading}
          agreementError={agreeError}
        />
      </div>
    </div>
  );
}
