import { hashPassword } from '@utils/crypto';
import { getCookie } from '@utils/cookie';
import { GoodDate } from '@utils/datetime';
import { errorBadRequest, errorForbidden, errorNotFound } from '@utils/error-msg';

enum AdminType {
    AdminSU,
    AdminInstructor,
    AdminLocalOrg,
    AdminLocalCommittee,
    AdminOrg,
    AdminCommittee,
}

const AdminTypeString = ['超级管理员', '指导老师', '院管组织', '院团委', '校级组织', '校团委'];

export class Admin {
    id: string;
    name: string;
    type: AdminType;
    description: string;
    head: string;
    password: string;
    createdAt: GoodDate;
    deletedAt: GoodDate | undefined;

    constructor(
        id: string,
        name: string,
        type: AdminType,
        description: string,
        head: string,
        password: string,
        createdAt: string | GoodDate,
        deletedAt?: string | GoodDate,
    ) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.description = description;
        this.head = head;
        this.password = password;
        this.createdAt = typeof createdAt === 'string' ? GoodDate.fromString(createdAt) : createdAt;
        this.deletedAt = deletedAt
            ? typeof deletedAt === 'string'
                ? GoodDate.fromString(deletedAt)
                : deletedAt
            : undefined;
    }

    static fromJSON(json: any): Admin {
        return new Admin(
            json.id,
            json.name,
            json.type,
            json.description,
            json.head,
            json.password,
            json.createdAt,
            json.updatedAt,
        );
    }

    static fromJSONList(json: any): Admin[] {
        return json.map((item: any) => Admin.fromJSON(item));
    }

    static template = new Admin(
        '', '', AdminType.AdminSU,
        '', '', '',
        new GoodDate(), undefined);

    typeString() {
        return AdminTypeString[this.type];
    }

    static list = async (limit: number, offset: number, type: AdminType, props: { serverEndpoint?: string }) => {
        const response = await fetch(
            props.serverEndpoint + '/admins' + `?limit=${limit}&offset=${offset}&type=${type}`,
        );
        const json = await response.json();
        if (response.ok) {
            return Admin.fromJSONList(json);
        } else if (response.status === 400) {
            throw new Error(errorBadRequest);
        } else {
            throw new Error(json['error']);
        }
    };

    static get = async (id: string, props: { serverEndpoint?: string }) => {
        const response = await fetch(props.serverEndpoint + '/admins/' + id);
        const json = await response.json();
        if (response.ok) {
            return Admin.fromJSON(json);
        } else if (response.status === 404) {
            throw new Error(errorNotFound);
        } else {
            throw new Error(json['error']);
        }
    };

    static create = async (
        data: {
            name: string;
            type: number;
            password: string;
            head: string;
        },
        props: { serverEndpoint?: string },
    ) => {
        const response = await fetch(props.serverEndpoint + '/admins/new', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: getCookie('token') || '',
            },
            body: JSON.stringify(data),
        });

        const json = await response.json();

        if (response.ok) {
            return Admin.fromJSON(json.data);
        } else if (response.status === 403) {
            throw new Error(errorForbidden);
        } else {
            throw new Error(json.error);
        }
    };

    static update = async (
        id: string,
        data: {
            name: string;
            type: AdminType;
            description: string;
            password: string;
            head: string;
        },
        props: { serverEndpoint?: string },
    ) => {
        if (data.password !== '') {
            data.password = await hashPassword(data.password);
        }

        const response = await fetch(props.serverEndpoint + '/admins/update/' + id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: getCookie('token') || '',
            },
            body: JSON.stringify(data),
        });
        const json = await response.json();

        if (response.ok) {
            return Admin.fromJSON(json.data);
        } else if (response.status === 400) {
            throw new Error(errorBadRequest);
        } else if (response.status === 403) {
            throw new Error(errorForbidden);
        } else if (response.status === 404) {
            throw new Error(errorNotFound);
        } else {
            throw new Error(json.error);
        }
    };

    static delete = async (id: string, props: { serverEndpoint?: string }) => {
        const response = await fetch(props.serverEndpoint + '/admins/' + id, {
            method: 'DELETE',
            headers: {
                Authorization: getCookie('token') || '',
            },
        });
        if (response.ok) {
            return true;
        } else if (response.status === 403) {
            throw new Error(errorForbidden);
        } else if (response.status === 404) {
            throw new Error(errorNotFound);
        } else {
            const json = await response.json();
            throw new Error(json.error);
        }
    };

    static signIn = async (
        data: {
            name: string;
            password: string;
        },
        props: { serverEndpoint?: string },
    ): Promise<{ token: string; admin: Admin }> => {
        const response = await fetch(props.serverEndpoint + '/users/sign-in', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: getCookie('token') || '',
                },
                body: JSON.stringify(data),
            }),
            json = await response.json();
        if (response.ok) {
            return { token: json.data.token as string, admin: Admin.fromJSON(json.data.admin) };
        } else {
            throw new Error(json.error);
        }
    };
}
