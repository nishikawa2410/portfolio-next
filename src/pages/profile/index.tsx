import ProfileComponent from "components/Profile";
import Seo from "components/Seo";

export default function Profile(): JSX.Element {
  return (
    <>
      <Seo title="Profile" />
      <ProfileComponent />
    </>
  );
}
