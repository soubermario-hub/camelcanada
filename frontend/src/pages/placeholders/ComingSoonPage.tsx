import { useParams } from 'react-router-dom';

export function ComingSoonPage() {
  const { slug } = useParams();
  return <div><h2>Coming soon</h2><p>{slug}</p></div>;
}
