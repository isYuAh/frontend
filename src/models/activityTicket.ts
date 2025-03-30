import { getCookie } from '@utils/cookie';
import { errorBadRequest, errorForbidden, errorInternal, errorNotFound } from '@utils/error-msg';

export class ActivityTicket {
    id: string;
    detailId: string;
    student: string;
    type: number;
    points: number;
    updatedAt?: Date;
    deletedAt?: Date;

    constructor(id: string, detailId: string, student: string, type: number, points: number, updatedAt?: Date, deletedAt?: Date) {
        this.id = id;
        this.detailId = detailId;
        this.student = student;
        this.type = type;
        this.points = points;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    static fromJSON(json: any): ActivityTicket {
        return new ActivityTicket(
            json.id,
            json.detailId,
            json.student,
            json.type,
            json.points,
            json.updatedAt ? new Date(json.updatedAt) : undefined,
            json.deletedAt ? new Date(json.deletedAt) : undefined
        );
    }

    static fromJSONList(json: any): ActivityTicket[] {
        return json.map((item: any) => ActivityTicket.fromJSON(item));
    }

    static template(): ActivityTicket {
        return new ActivityTicket('', '', '', 0, 0);
    }

    static list = async (activityId: string, props: { serverEndpoint?: string }) => {
        const response = await fetch(props.serverEndpoint + '/activity/' + activityId + '/ticket');
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

    static create = async (
        activityId: string,
        data: Array<{
            detailId: string;
            student: string;
            type: number;
            points: number;
        }>,
        props: { serverEndpoint?: string }
    ) => {
        const response = await fetch(
            props.serverEndpoint + '/activity/' + activityId + '/ticket/new',
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
        } else if (response.status === 500) {
            throw new Error(errorInternal);
        } else {
            throw new Error(json['error']);
        }
    };

    static delete = async (activityId: string, ticketId: string, props: { serverEndpoint?: string }) => {
        const response = await fetch(
            props.serverEndpoint + '/activity/' + activityId + '/ticket/' + ticketId,
            {
                method: 'DELETE',
                headers: {
                    Authorization: getCookie('token') || '',
                },
            }
        );

        const json = await response.json();

        if (response.ok) {
            return json;
        } else if (response.status === 400) {
            throw new Error(errorBadRequest);
        } else if (response.status === 403) {
            throw new Error(errorForbidden);
        } else if (response.status === 500) {
            throw new Error(errorInternal);
        } else {
            throw new Error(json['error']);
        }
    };

    static update = async (
        activityId: string,
        ticketId: string,
        data: {
            detailId: string;
            student: string;
            type: number;
            points: number;
        },
        props: { serverEndpoint?: string }
    ) => {
        const response = await fetch(
            props.serverEndpoint + '/activity/' + activityId + '/ticket/' + ticketId,
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
        } else if (response.status === 500) {
            throw new Error(errorInternal);
        } else {
            throw new Error(json['error']);
        }
    };
}