import { hashPassword } from '@utils/crypto';
import { getCookie } from '@utils/cookie';
import { GoodDate } from '@utils/datetime';
import { errorBadRequest, errorForbidden, errorNotFound } from '@utils/error-msg';

enum UserType {
    UserSU,
    UserInstructor,
    UserLocalOrg,
    UserLocalCommittee,
    UserOrg,
    UserCommittee,
    UserStudent
}

const UserTypeString = ['超级管理员', '指导老师', '院管组织', '院团委', '校级组织', '校团委'];

export class User {
    id: string;
    name: string;
    type: UserType;
    description: string;
    head: string;
    password: string;
    createdAt: GoodDate;
    deletedAt: GoodDate | undefined;

    constructor(
        id: string,
        name: string,
        type: UserType,
        description: string,
        head: string,
        password: string,
        createdAt: string | GoodDate,
        deletedAt?: string | GoodDate
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

    static fromJSON(json: any): User {
        return new User(
            json.id,
            json.name,
            json.type,
            json.description,
            json.head,
            json.password,
            json.createdAt,
            json.updatedAt
        );
    }

    static fromJSONList(json: any): User[] {
        return json.map((item: any) => User.fromJSON(item));
    }

    static template = new User('', '', UserType.UserSU, '', '', '', new GoodDate(), undefined);

    typeString() {
        return UserTypeString[this.type];
    }

    static list = async (limit: number, offset: number, type: UserType, props: { serverEndpoint?: string }) => {
        const response = await fetch(
            props.serverEndpoint + '/users' + `?limit=${limit}&offset=${offset}&type=${type}`
        );
        const json = await response.json();
        if (response.ok) {
            return User.fromJSONList(json);
        } else if (response.status === 400) {
            throw new Error(errorBadRequest);
        } else {
            throw new Error(json['error']);
        }
    };

    static get = async (id: string, props: { serverEndpoint?: string }) => {
        const response = await fetch(props.serverEndpoint + '/users/' + id);
        const json = await response.json();
        if (response.ok) {
            return User.fromJSON(json);
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
        props: { serverEndpoint?: string }
    ) => {
        const response = await fetch(props.serverEndpoint + '/users/new', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: getCookie('token') || '',
            },
            body: JSON.stringify(data),
        });

        const json = await response.json();

        if (response.ok) {
            return User.fromJSON(json.data);
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
            type: UserType;
            description: string;
            password: string;
            head: string;
        },
        props: { serverEndpoint?: string }
    ) => {
        if (data.password !== '') {
            data.password = await hashPassword(data.password);
        }

        const response = await fetch(props.serverEndpoint + '/users/update/' + id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: getCookie('token') || '',
            },
            body: JSON.stringify(data),
        });
        const json = await response.json();

        if (response.ok) {
            return User.fromJSON(json.data);
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
        const response = await fetch(props.serverEndpoint + '/users/' + id, {
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

    static async signIn(
        credentials: { name: string; password: string },
        options: { serverEndpoint?: string } = {}
    ) {
        const endpoint = options.serverEndpoint || '';

        const response = await fetch(`${endpoint}/user/sign-in`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '登录失败');
        }

        return await response.json();
    }
}
