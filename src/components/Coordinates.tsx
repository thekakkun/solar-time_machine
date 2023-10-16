import { useState } from "react";

export default function Coordinates() {
  const [coordinates, setCoordinates] = useState<GeolocationPosition | null>(
    null
  );
}
