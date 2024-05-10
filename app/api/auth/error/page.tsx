import { NextPage } from 'next';
import { useRouter } from 'next/router';

const ErrorPage: NextPage = () => {
    const router = useRouter();
    const { errorCode } = router.query;

    return (
        <div>
            <h1>Error Page</h1>
            <p>Error Code: {errorCode}</p>
            <p>Oops! Something went wrong.</p>
        </div>
    );
};

export default ErrorPage;