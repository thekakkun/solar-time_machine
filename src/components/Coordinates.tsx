import { useEffect, useState } from "react";
import usePromise from "../hooks/usePromise";

export default function Coordinatess() {
  const positionState = usePromise(usePositionPromise());

  useEffect(() => {
    console.log(positionState);

    return () => {
      if ("value" in positionState) {
        navigator.geolocation.clearWatch(positionState.value.watchId);
      }
    };
  }, [positionState]);

  if ("value" in positionState) {
    return (
      <p>
        lat: {positionState.value.pos?.coords.latitude}
        lon: {positionState.value.pos?.coords.longitude}
      </p>
    );
  } else if ("reason" in positionState) {
    if (positionState.reason instanceof GeolocationPositionError) {
      switch (positionState.reason.code) {
        case 1:
          return <p>permission denied</p>;
        case 2:
          return <p>position unavailable</p>;
        case 3:
          return <p>timeout</p>;
      }
    } else {
      return <p>{positionState.reason}</p>;
    }
  } else {
    return <p>Location pending</p>;
  }
}

interface Position {
  watchId: number;
  pos: GeolocationPosition | null;
}

function usePositionPromise(): Promise<Position> {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);

  return new Promise(async (resolve, reject) => {
    // Check if geolocation services are available
    if (!("geolocation" in navigator)) {
      reject({
        ...new GeolocationPositionError(),
        code: GeolocationPositionError.POSITION_UNAVAILABLE,
      } as GeolocationPositionError);
    }

    // Check existing geolocation permission
    let res: PermissionStatus = await navigator.permissions.query({
      name: "geolocation",
    });
    if (res.state == "denied") {
      reject({
        ...new GeolocationPositionError(),
        code: GeolocationPositionError.PERMISSION_DENIED,
      } as GeolocationPositionError);
    }

    // Start watching geolocation
    const watchId = navigator.geolocation.watchPosition(setPosition, reject);
    resolve({
      watchId: watchId,
      pos: position,
    });
  });
}
