import { getCookie } from '@utils/cookie';
import { errorBadRequest, errorForbidden, errorInternal, errorNotFound } from '@utils/error-msg';

export enum ReviewState {
    ReviewInstructorPending,
    ReviewInstructorRejected,
    ReviewCommitteePending,
    ReviewCommitteeApproved,
    ReviewCommitteeRejected
}

export class Review {
    id: string;
    type: number;
    owner: string;
    instructor: string;
    instructorComment: string;
    committee: string;
    committeeComment: string;
    state: ReviewState;
    updatedAt?: Date;

    constructor(
        id: string,
        type: number,
        owner: string,
        instructor: string,
        instructorComment: string,
        committee: string,
        committeeComment: string,
        state: number,
        updatedAt?: Date
    ) {
        this.id = id;
        this.type = type;
        this.owner = owner;
        this.instructor = instructor;
        this.instructorComment = instructorComment;
        this.committee = committee;
        this.committeeComment = committeeComment;
        this.state = state;
        this.updatedAt = updatedAt;
    }

    static fromJSON(json: any): Review {
        return new Review(
            json.id,
            json.type,
            json.owner,
            json.instructor,
            json.instructorComment,
            json.committee,
            json.committeeComment,
            json.state,
            json.updatedAt ? new Date(json.updatedAt) : undefined
        );
    }

    static fromJSONList(json: any): Review[] {
        return json.map((item: any) => Review.fromJSON(item));
    }

    static template(): Review {
        return new Review('', 0, '', '', '', '', '', 0);
    }

    static list = async (activityId: string, props: { serverEndpoint?: string }) => {
        const response = await fetch(props.serverEndpoint + '/activity/' + activityId + '/review');
        const json = await response.json();
        if (response.ok) {
            return json;
        } else if (response.status === 400) {
            throw new Error(errorBadRequest);
        } else if (response.status === 403) {
            throw new Error(errorForbidden);
        } else if (response.status === 404) {
            throw new Error(errorNotFound);
        } else if (response.status === 500) {
            throw new Error(errorInternal);
        } else {
            throw new Error(json['error']);
        }
    };

    static update = async (
        activityId: string,
        reviewId: string,
        data: { state: boolean; comment: string },
        props: { serverEndpoint?: string }
    ) => {
        const response = await fetch(
            props.serverEndpoint + '/activity/' + activityId + '/review/' + reviewId,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: getCookie('token') || '',
                },
                body: JSON.stringify(data),
            }
        );
        const json = await response.json();

        if (response.ok) {
            return json;
        } else if (response.status === 400) {
            throw new Error(errorBadRequest);
        } else if (response.status === 403) {
            throw new Error(errorForbidden);
        } else if (response.status === 404) {
            throw new Error(errorNotFound);
        } else if (response.status === 500) {
            throw new Error(errorInternal);
        } else {
            throw new Error(json.error);
        }
    };

    static create = async (
        activityId: string,
        props: { serverEndpoint?: string }
    ) => {
        const response = await fetch(
            props.serverEndpoint + '/activity/' + activityId + '/review/new',
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: getCookie('token') || '',
                },
            }
        );
        const json = await response.json();

        if (response.ok) {
            return json;
        } else if (response.status === 500) {
            throw new Error(errorInternal);
        } else {
            throw new Error(json.error);
        }
    };
}