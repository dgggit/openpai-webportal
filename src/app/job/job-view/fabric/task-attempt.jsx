// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
// documentation files (the "Software"), to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
// to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
// BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import React, { useEffect, useState } from 'react';
import { Stack, ActionButton, Text } from 'office-ui-fabric-react';
import ReactDOM from 'react-dom';
import { isNil, capitalize } from 'lodash';
import { DateTime, Interval } from 'luxon';

import { SpinnerLoading } from '../../../components/loading';
import TaskAttemptList from './task-attempt/task-attempt-list';
import { fetchTaskStatus } from './task-attempt/conn';
import StatusBadge from '../../../components/status-badge';
import { getDurationString } from '../../../components/util/job';
import Card from './job-detail/components/card';
import HorizontalLine from '../../../components/horizontal-line';

const params = new URLSearchParams(window.location.search);
const userName = params.get('username');
const jobName = params.get('jobName');
const jobAttemptIndex = params.get('jobAttemptIndex');
const taskRoleName = params.get('taskRoleName');
const taskIndex = params.get('taskIndex');

const TaskAttemptPage = () => {
  const [loading, setLoading] = useState(true);
  const [taskStatus, setTaskStatus] = useState(null);

  const getTimeDuration = (startMs, endMs) => {
    const start = startMs && DateTime.fromMillis(startMs);
    const end = endMs && DateTime.fromMillis(endMs);
    if (start) {
      return Interval.fromDateTimes(start, end || DateTime.utc()).toDuration([
        'days',
        'hours',
        'minutes',
        'seconds',
      ]);
    } else {
      return null;
    }
  };

  useEffect(() => {
    fetchTaskStatus(
      userName,
      jobName,
      jobAttemptIndex,
      taskRoleName,
      taskIndex,
    ).then(data => {
      setTaskStatus(data);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      {loading && <SpinnerLoading />}
      {!loading && (
        <Stack styles={{ root: { margin: '30px' } }} gap='l1'>
          <div>
            <ActionButton
              iconProps={{ iconName: 'revToggleKey' }}
              href={`job-detail.html?username=${userName}&jobName=${jobName}`}
            >
              Go to Job Detail
            </ActionButton>
          </div>
          <Card style={{ padding: 10 }}>
            <Stack>
              <Stack horizontal gap='m' padding='m'>
                <Text>Job Name:</Text>
                <Text>{jobName}</Text>
              </Stack>
              <HorizontalLine />
              <Stack horizontal gap='l1' padding='m'>
                <Stack gap='m'>
                  <Text>Job Attempt Index</Text>
                  <Text>{jobAttemptIndex}</Text>
                </Stack>
                <Stack gap='m'>
                  <Text>Task Role</Text>
                  <Text>{taskRoleName}</Text>
                </Stack>
                <Stack gap='m'>
                  <Text>Task Index</Text>
                  <Text>{taskIndex}</Text>
                </Stack>
                <Stack gap='m'>
                  <Text>Task Uid</Text>
                  <Text>{taskStatus.taskUid}</Text>
                </Stack>
              </Stack>
              <HorizontalLine />
              <Stack horizontal gap='l1' padding='m'>
                <Stack gap='m'>
                  <Text>Task State</Text>
                  <StatusBadge status={capitalize(taskStatus.taskState)} />
                </Stack>
                <Stack gap='m'>
                  <Text>Task Retries</Text>
                  <Text>{taskStatus.retries}</Text>
                </Stack>
                <Stack gap='m'>
                  <Text>Task Creation Time</Text>
                  <Text>
                    {isNil(taskStatus.createdTime)
                      ? 'N/A'
                      : DateTime.fromMillis(
                          taskStatus.createdTime,
                        ).toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS)}
                  </Text>
                </Stack>
                <Stack gap='m'>
                  <Text>Task Duration</Text>
                  <Text>
                    {getDurationString(
                      getTimeDuration(
                        taskStatus.createdTime,
                        taskStatus.completedTime,
                      ),
                    )}
                  </Text>
                </Stack>
                <Stack gap='m'>
                  <Text>Task Running Start Time</Text>
                  <Text>
                    {isNil(taskStatus.launchedTime)
                      ? 'N/A'
                      : DateTime.fromMillis(
                          taskStatus.launchedTime,
                        ).toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS)}
                  </Text>
                </Stack>
                <Stack gap='m'>
                  <Text>Task Running Duration</Text>
                  <Text>
                    {getDurationString(
                      getTimeDuration(
                        taskStatus.launchedTime,
                        taskStatus.completedTime,
                      ),
                    )}
                  </Text>
                </Stack>
              </Stack>
            </Stack>
          </Card>
          <TaskAttemptList
            taskAttempts={isNil(taskStatus) ? null : taskStatus.attempts}
          />
        </Stack>
      )}
    </div>
  );
};

ReactDOM.render(
  <TaskAttemptPage />,
  document.getElementById('content-wrapper'),
);
